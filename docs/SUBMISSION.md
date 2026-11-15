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
- 공개 홈페이지의 예상 주소: https://leekybin.github.io/SAYFE-contest-submission/
  - **GitHub Pages 설정과 외부 접속 확인을 완료한 뒤에만 제출합니다.**
  - 이 문서에 주소를 적는 것만으로 배포가 완료되지는 않습니다.

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
| 선택 | SDK 테스트 APK | 현재 기능이 도어 조회·NaviHelper 연결 테스트임을 명시 |

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
