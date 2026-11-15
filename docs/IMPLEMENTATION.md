# 구현 및 검증 범위

## Android 앱

실제 코드는 app/src/main/java/com/example/myhyundai/MainActivity.kt에 있습니다.

- Kotlin Activity에서 Vehicle SDK와 NaviHelper를 초기화합니다.
- 도어 capability를 조회한 뒤 지원되는 영역의 현재값을 조회합니다.
- 운전석 앞문·조수석 앞문·뒷좌석 왼쪽·뒷좌석 오른쪽을 표시합니다.
- SDK 콜백의 화면 갱신은 UI 스레드에서 수행합니다.
- Activity 종료 시 각 SDK의 release를 호출합니다.
- 현재 구현은 사고 감지나 차량 자동 제어 앱이 아닙니다.
- 현재 도어값으로 사고 당시 상태나 사고 원인을 추정하지 않습니다.

## 개발 환경

| 항목 | 설정 |
|---|---|
| 모듈 | :app |
| Vehicle | ai.pleos.playground:Vehicle:2.3.2 |
| NaviHelper | ai.pleos.playground:NaviHelper:3.0.5 |
| Android SDK | compile / target 37, min 34 |
| Gradle Daemon JVM | 25 |
| 테스트 환경 | Pleos Connect v2.1.0 전용 AVD, Android API 34 |
| 전체 화면 | 2560×1440 px, 가로, 160dpi |
| 앱 패널 | 테스트 시 약 1682×1210 px |

## 확인한 결과

- :app:assembleDebug 빌드 성공 및 에뮬레이터 설치·실행
- 네 도어의 ‘닫힘’ 현재값 수신 확인
- Virtual Console로 주행·제동·정차 상태를 설정하고 실제 화면 녹화
- 실제 촬영 속도 0→45km/h→0, 기어 D→P
- 콘셉트 애니메이션의 8개 대표 장면 렌더링 및 JavaScript 오류 없음 확인
- 두 최종 MP4 전체 프레임 디코딩 검사 통과
- Chrome 기반 브라우저에서 두 영상의 재생시간·디코딩 프레임 증가 및 오류 없음 확인
- 최종 영상 형식: H.264 MP4, 1920×1080, 30fps, 약 79.93초, 음성 없음

위 내용은 개발 환경에서 수행한 확인 결과입니다. 실차 검증이나 모든 환경에서의 동작 보증을 뜻하지 않습니다.

## 제출 release APK 검증

- 제출 경로: apk/보이소_SAYFE_release.apk
- release 빌드 및 전용 RSA 키 서명 완료, debuggable=false 확인
- APK Signature Scheme v3 및 정렬 검증 통과
- 동일한 서명 APK를 Pleos v2.1.0 에뮬레이터에 설치·실행
- NaviHelper 연결 성공 화면 확인
- Vehicle capability READ_WRITE 및 네 도어 닫힘(0) 조회 확인
- 크기: 13,712,409 bytes
- SHA-256: b1fb38d2caa22b4e990f276909584571f27b5df43382ff3903976435e83dca94

초기 release의 Kotlin·AndroidX 선택 최적화 결과에서 androidx.startup 초기화 중 IllegalAccessError가 발생했습니다.
release 최적화를 비활성화한 뒤 재빌드·서명했고, 현재 APK에서 정상 실행과 SDK 조회를 확인했습니다.
서명된 release 파일이며 디버그 APK를 단순히 이름만 바꾼 것이 아닙니다.
배포용 서명 키와 비밀번호는 Git에서 제외합니다.

## 다음 개발 범위

1. 주행 UX 제한 상태와 연동한 상세 입력 제한
2. 문자·선택형 응답 중심의 사고 대응 Android UI
3. STT/TTS SDK 사용 가능 여부 및 권한 검증
4. 사용자가 확인한 위치·당사자별 진술·사진 기록
5. AI 분석 결과의 불확실성 표시 및 사용자 검토
6. 인계용 문서 생성, 승인한 자료만 공유
7. Gleo 기능 호출 및 보험사 제휴 API 가능 범위 검증

이 항목들은 개발 계획이며, 현재 APK의 구현 기능으로 소개하지 않습니다.
