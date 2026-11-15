# 공모전 제출 링크 및 공개 안내

## 제출용 설명 문구

SAYFE는 청각장애 운전자의 사고 대응을 돕는 차량용 앱 아이디어입니다.
저장소에는 안전 확인·현장 소통·자료 정리·검토 후 인계의 화면 시안과 약 80초 시연 영상 2종,
Pleos Connect 환경의 Vehicle SDK 2.3.2·NaviHelper 3.0.5 연동 테스트 코드를 제공합니다.
실제 에뮬레이터 주행·감속·정차 촬영과 별도 사고 재현을 구분하여 제시했습니다.
사고 대응 UI는 콘셉트이며 자동 사고 감지·음성·AI·보험사 전송은 연결하지 않았습니다.

## 포함 문서

- [현대차 공모전 신청 및 기획서 원본](SAYFE-application-plan.docx)
- 제출자의 공개 포함 요청에 따라 원본을 수정하지 않고 추가합니다.

## 제출 링크

- 저장소: https://github.com/leekybin/SAYFE-contest-submission
- README: https://github.com/leekybin/SAYFE-contest-submission#readme
- 화면 시안 및 영상 경로: 저장소 demo/ 폴더
- 공개 홈페이지: https://leekybin.github.io/SAYFE-contest-submission/
- APK 파일 경로: **apk/보이소_SAYFE_release.apk**
- APK 다운로드: https://raw.githubusercontent.com/leekybin/SAYFE-contest-submission/main/apk/%EB%B3%B4%EC%9D%B4%EC%86%8C_SAYFE_release.apk
- APK 정보: release / debuggable=false / 13,712,409 bytes / Pleos Connect v2.1.0 설치·실행 확인

## 접수 페이지에 입력할 값

- 저장소 주소: https://github.com/leekybin/SAYFE-contest-submission
- APK 파일 경로: apk/보이소_SAYFE_release.apk
- 앱 이름 / 팀명: SAYFE / 보이소

APK는 저장소에 직접 포함합니다. 현재 크기는 약 13.7MB로 별도 GitHub Releases 링크를 사용하지 않습니다.

## 접수 메일에 추가할 내용

```text
GitHub 저장소: https://github.com/leekybin/SAYFE-contest-submission
APK 파일 경로: apk/보이소_SAYFE_release.apk
최종 커밋 번호: git rev-parse HEAD 명령으로 확인한 전체 40자리 값을 입력
시연 홈페이지: https://leekybin.github.io/SAYFE-contest-submission/
```

심사는 메일에 적은 커밋을 기준으로 진행됩니다. 업로드가 완료된 최종 커밋의 전체 해시를 복사합니다.

```text
git rev-parse HEAD
git ls-remote origin refs/heads/main
```

두 값이 같은지 확인한 뒤 메일에 기재합니다. 커밋을 추가하면 해시가 바뀌므로 최종 푸시 후 다시 확인합니다.
현재 저장소는 Public입니다. 제공된 안내에 따라 11월 23일 1차 심사 결과 발표일까지 공개 상태를 유지합니다.
Private으로 변경할 경우에는 안내에 적힌 11월 16일 공개 전환 기한을 지킵니다.
이 저장소 정리는 접수 메일 발송이나 접수 완료를 대신하지 않습니다.

## GitHub Pages 설정

1. 저장소에 제출 자료가 반영됐는지 확인합니다.
2. GitHub 저장소 Settings → Pages를 엽니다.
3. Build and deployment → Source에서 Deploy from a branch를 선택합니다.
4. Branch는 main, 폴더는 /(root)를 선택하고 저장합니다.
5. 배포 완료 후 표시되는 공개 주소를 로그인하지 않은 브라우저에서도 엽니다.
6. 두 영상의 재생·다운로드, 4개 화면 시안, 저장소 링크를 확인합니다.

root의 index.html은 demo/index.html로 연결하며 .nojekyll을 포함합니다.
공개 홈페이지의 상대 경로는 저장소 이름이 붙는 프로젝트 Pages 주소에서도 동작하도록 작성했습니다.

## 제출할 때 사용할 자료

| 우선순위 | 자료 | 용도 |
|---|---|---|
| 1 | 공개 홈페이지 | 심사위원이 설치 없이 영상·화면 시안을 확인 |
| 2 | GitHub README | 아이디어, 구현 범위, 소스 및 실행 방법 |
| 3 | SAYFE_pleos_demo.mp4 | 실제 Pleos 환경과 사고 대응 경험을 함께 설명 |
| 4 | SAYFE_concept_demo.mp4 | 동일 시나리오를 애니메이션으로 집중 설명 |
| 필수 개발 산출물 | apk/보이소_SAYFE_release.apk | 실행 가능한 서명된 release APK. 현재 기능은 도어 조회·NaviHelper 연결 테스트 |

MP4를 Android Studio 에디터로 열면 텍스트나 파일 크기 경고가 나올 수 있습니다.
심사 자료에는 IDE 경로나 해당 PC의 로컬 주소 대신 공개 홈페이지를 제출합니다.

## 공개 제외

- 별도 운영자료 (단, 제출자가 지정한 docs/SAYFE-application-plan.docx 원본은 공개 포함 요청에 따라 추가)
- 개인 PC 경로가 포함되는 local.properties와 IDE 설정
- 계정 인증 정보·API 키·서명 키
- 빌드 캐시·node_modules·로컬 녹화 원본과 중복 WebM

저장소 URL·소유자 계정·커밋 작성자·이력·Release·GitHub 프로필은 공개되면 확인될 수 있습니다.
공모전 익명 심사 기준은 제출자가 저장소 계정과 이력까지 확인해야 합니다.
기존 원격 이력은 이 작업에서 삭제하거나 덮어쓰지 않습니다.

## 개발자용 재생성

현재 MP4와 PNG가 이미 포함되어 있으므로 심사위원은 렌더링 도구를 설치할 필요가 없습니다.

Node.js와 Chrome이 설치된 Windows에서:

```text
npm.cmd install --prefix demo/render-tools --no-save --package-lock=false playwright @ffmpeg-installer/win32-x64
node demo/render-demo.cjs
node demo/export-mp4.cjs
```

Pleos 합성본은 별도 로컬 촬영 원본이 있어야 합니다. 원본은 공개에서 제외합니다.
촬영 재실행은 전용 Pleos AVD와 Virtual Console이 연결된 개발 환경에서만 수행합니다.

```text
node demo/capture-pleos.cjs
node demo/compose-pleos.cjs
```

촬영 스크립트는 에뮬레이터 상태를 변경하며 마지막에 속도 0·P로 정차시킵니다.
