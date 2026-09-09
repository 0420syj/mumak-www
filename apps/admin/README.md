# Media Admin

JPEG를 R2에 발행하고 블로그용 JPEG/WebP 주소와 MDX snippet을 만드는 내부 운영 도구다.
인증·인코딩·불변성 계약은 [architecture.md](docs/architecture.md), 운영 설정은
[r2-setup.md](docs/r2-setup.md)를 따른다.

## 사용

[관리자 페이지](https://admin.wannysim.com)에서 업로드 토큰으로 한 번 로그인한다.
같은 브라우저에서 7일간 유지되며 새로고침해도 다시 입력하지 않는다. JPEG와 대체 텍스트를 입력해
발행하고 MDX snippet을 블로그 본문에 붙인다. 사용을 마치면 로그아웃할 수 있다.

## 로컬 실행

`.env.example`의 환경 변수를 Git에 포함되지 않는 `.env.local`에 설정한다.
서버에는 운영자 토큰의 SHA-256 digest와 독립적인 `MEDIA_ADMIN_SESSION_SECRET`(64자리 hex)을
설정한다. R2 키와 signing secret은 클라이언트에 노출하지 않는다.

```sh
pnpm --filter admin dev
```

로컬 origin은 `http://admin.mumak.localhost:1355`다. 직접 업로드를 테스트할 origin은 private
버킷 CORS에도 등록해야 한다. 운영 credential과 테스트 저장소를 공유할 때는 용량 장부도 공유된다.

## 배포

`apps/admin`을 root directory로 하는 별도 Vercel 프로젝트를 사용한다.
GitHub 저장소에 연결되어 main push는 운영 자동 배포, 나머지 브랜치·PR은 Preview 자동 배포다.
R2 credential, 운영자 token digest와 session secret은 production 환경에 설정하고 preview에는 자동 제공하지 않는다.
이미지는 private staging으로 직접 전송하고, 서버의 임시 디렉터리에서 변환한 뒤 R2에 저장한다.
로컬 E2E는 standalone build를 사용한다. 영구 파일은 서버 디스크에 보관하지 않는다.
