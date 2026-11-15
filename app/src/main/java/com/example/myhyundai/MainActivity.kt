
package com.example.myhyundai

import android.app.Activity
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView

// Vehicle SDK 2.3.2
import ai.pleos.playground.vehicle.Vehicle
import ai.pleos.playground.vehicle.api.model.area.DoorArea
import ai.pleos.playground.vehicle.constant.area.DoorValue

// NaviHelper SDK 3.0.5
import ai.pleos.playground.navi.helper.NaviHelper

class MainActivity : Activity() {

    // 1. SDK 객체
    private var vehicle: Vehicle? = null
    private var naviHelper: NaviHelper? = null

    // 2. 네 개 도어 영역
    private val doorAreas = listOf(
        "운전석 앞문" to DoorArea(DoorValue.ROW_1_LEFT),
        "조수석 앞문" to DoorArea(DoorValue.ROW_1_RIGHT),
        "뒷좌석 왼쪽" to DoorArea(DoorValue.ROW_2_LEFT),
        "뒷좌석 오른쪽" to DoorArea(DoorValue.ROW_2_RIGHT)
    )

    // 3. 화면에 표시할 TextView
    private val doorTexts = mutableListOf<TextView>()
    private lateinit var vehicleStatusText: TextView
    private lateinit var naviStatusText: TextView

    // 4. Activity 종료 여부
    private var destroyed = false

    // 내비게이션 연결 요청 중인지 확인
    private var naviConnecting = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 세로 방향 레이아웃
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(32, 32, 32, 32)
        }

        // 스크롤 화면
        val scrollView = ScrollView(this)
        scrollView.addView(layout)

        // 앱 제목
        val title = TextView(this).apply {
            text = "My Hyundai - Pleos SDK 테스트"
            textSize = 23f
        }
        layout.addView(title)

        // =========================
        // Vehicle SDK 화면
        // =========================

        val vehicleTitle = TextView(this).apply {
            text = "\n[Vehicle SDK - 차량 도어]"
            textSize = 20f
        }
        layout.addView(vehicleTitle)

        vehicleStatusText = TextView(this).apply {
            text = "Vehicle SDK 연결 준비 중"
            textSize = 17f
        }
        layout.addView(vehicleStatusText)

        // 도어 4개 표시
        doorAreas.forEach { (name, _) ->
            val textView = TextView(this).apply {
                text = "$name : 조회 대기"
                textSize = 19f
                setPadding(0, 18, 0, 18)
            }

            doorTexts.add(textView)
            layout.addView(textView)
        }

        // 도어 새로고침 버튼
        val refreshButton = Button(this).apply {
            text = "4개 도어 상태 새로고침"
        }
        layout.addView(refreshButton)

        // =========================
        // NaviHelper SDK 화면
        // =========================

        val naviTitle = TextView(this).apply {
            text = "\n[NaviHelper SDK - 내비게이션]"
            textSize = 20f
        }
        layout.addView(naviTitle)

        naviStatusText = TextView(this).apply {
            text = "NaviHelper SDK 연결 대기 중"
            textSize = 17f
            setPadding(0, 16, 0, 16)
        }
        layout.addView(naviStatusText)

        // 내비게이션 연결 버튼
        val naviButton = Button(this).apply {
            text = "내비게이션 SDK 연결 확인"
        }
        layout.addView(naviButton)

        setContentView(scrollView)

        // Vehicle SDK 초기화
        initializeVehicle()

        // NaviHelper SDK 초기화
        initializeNaviHelper()

        // 도어 새로고침
        refreshButton.setOnClickListener {
            checkCapabilitiesAndRead()
        }

        // NaviHelper 연결 확인 및 재시도
        naviButton.setOnClickListener {
            initializeNaviHelper()
        }
    }

    // =========================
    // 공통 UI 업데이트
    // =========================

    private fun updateUi(action: () -> Unit) {
        runOnUiThread {
            if (!destroyed && !isFinishing) {
                action()
            }
        }
    }

    // =========================
    // Vehicle SDK 초기화
    // =========================

    private fun initializeVehicle() {
        try {
            vehicle = Vehicle(this)
            vehicle?.initialize()

            vehicleStatusText.text =
                "Vehicle SDK 초기화 완료 - 지원 확인 필요"

            Log.d("PleosDoor", "Vehicle SDK 초기화 완료")

        } catch (e: Exception) {
            vehicleStatusText.text =
                "Vehicle SDK 초기화 오류: ${e.message}"

            Log.e("PleosDoor", "Vehicle SDK 초기화 실패", e)
        }
    }

    // =========================
    // 도어 지원 범위 확인
    // =========================

    private fun checkCapabilitiesAndRead() {

        val sdk = vehicle ?: run {
            vehicleStatusText.text =
                "Vehicle SDK가 준비되지 않았습니다."
            return
        }

        vehicleStatusText.text = "도어 지원 범위 확인 중..."

        doorTexts.forEachIndexed { index, textView ->
            textView.text =
                "${doorAreas[index].first} : 확인 중"
        }

        try {
            sdk.getDoor().checkDoorPositionCapabilities(
                onComplete = { config, areaBounds ->

                    Log.d(
                        "PleosDoor",
                        "지원 확인: access=${config.accessType}"
                    )

                    updateUi {
                        vehicleStatusText.text =
                            "지원 정보 수신: ${config.accessType}"
                    }

                    doorAreas.forEachIndexed { index, entry ->
                        val name = entry.first
                        val area = entry.second
                        val bounds = areaBounds[area]

                        if (bounds == null) {
                            updateUi {
                                doorTexts[index].text =
                                    "$name : 지원 범위 없음"
                            }
                        } else {
                            Log.d(
                                "PleosDoor",
                                "$name 범위: " +
                                        "${bounds.minValue}.." +
                                        "${bounds.maxValue}"
                            )

                            readOneDoor(index, name, area)
                        }
                    }
                },

                onFailed = { e: Exception ->
                    updateUi {
                        vehicleStatusText.text =
                            "지원 확인 실패: ${e.message}"
                    }

                    Log.e(
                        "PleosDoor",
                        "Capability 오류",
                        e
                    )
                }
            )

        } catch (e: Exception) {
            updateUi {
                vehicleStatusText.text =
                    "API 호출 오류: ${e.message}"
            }

            Log.e(
                "PleosDoor",
                "Capability 호출 오류",
                e
            )
        }
    }

    // =========================
    // 개별 도어 상태 조회
    // =========================

    private fun readOneDoor(
        index: Int,
        name: String,
        area: DoorArea
    ) {
        val sdk = vehicle ?: return

        try {
            sdk.getDoor().getCurrentDoorPosition(
                area = area,

                onComplete = { position: Int? ->

                    val result = when (position) {
                        0 -> "닫힘 (0)"
                        1 -> "열림 (1)"
                        null -> "현재값 없음"
                        else -> "위치 값 $position"
                    }

                    updateUi {
                        doorTexts[index].text =
                            "$name : $result"
                    }

                    Log.d(
                        "PleosDoor",
                        "$name 조회 결과: $position"
                    )
                },

                onFailed = { e: Exception ->
                    updateUi {
                        doorTexts[index].text =
                            "$name : 조회 실패"
                    }

                    Log.e(
                        "PleosDoor",
                        "$name 조회 오류",
                        e
                    )
                }
            )

        } catch (e: Exception) {
            updateUi {
                doorTexts[index].text =
                    "$name : API 호출 오류"
            }

            Log.e(
                "PleosDoor",
                "$name 호출 오류",
                e
            )
        }
    }

    // =========================
    // NaviHelper SDK 초기화
    // =========================

    private fun initializeNaviHelper() {

        if (naviConnecting) {
            naviStatusText.text = "내비게이션 연결 진행 중..."
            return
        }

        // 이미 생성된 객체는 재사용
        val sdk = try {
            naviHelper ?: NaviHelper(applicationContext).also {
                naviHelper = it
            }
        } catch (e: Exception) {
            naviStatusText.text =
                "NaviHelper 객체 생성 실패: ${e.message}"

            Log.e("PleosNavi", "객체 생성 실패", e)
            return
        }

        naviConnecting = true
        naviStatusText.text = "NaviHelper 연결 중..."

        try {
            sdk.initialize(
                onConnected = {
                    updateUi {
                        naviConnecting = false
                        naviStatusText.text =
                            "NaviHelper SDK 연결 성공!"
                    }

                    Log.d(
                        "PleosNavi",
                        "NaviHelper SDK 연결 성공!"
                    )
                },

                onFailed = { throwable ->
                    updateUi {
                        naviConnecting = false
                        naviStatusText.text =
                            "NaviHelper 연결 실패: ${throwable.message}"
                    }

                    Log.e(
                        "PleosNavi",
                        "NaviHelper SDK 연결 실패",
                        throwable
                    )
                }
            )

        } catch (e: Exception) {
            naviConnecting = false

            naviStatusText.text =
                "NaviHelper 초기화 오류: ${e.message}"

            Log.e(
                "PleosNavi",
                "NaviHelper 초기화 오류",
                e
            )
        }
    }

    // =========================
    // Activity 종료 시 SDK 해제
    // =========================

    override fun onDestroy() {
        destroyed = true

        try {
            naviHelper?.release()
            naviHelper = null

            Log.d("PleosNavi", "NaviHelper SDK 해제")

        } catch (e: Exception) {
            Log.e("PleosNavi", "NaviHelper 해제 오류", e)
        }

        try {
            vehicle?.release()
            vehicle = null

            Log.d("PleosDoor", "Vehicle SDK 해제")

        } catch (e: Exception) {
            Log.e("PleosDoor", "Vehicle SDK 해제 오류", e)
        }

        super.onDestroy()
    }
}
