# 인터넷에 올리는 방법

이 게임은 정적 웹 게임이라서 `dist` 폴더만 인터넷 호스팅에 올리면 컴퓨터가 꺼져도 링크로 접속할 수 있습니다.

## 가장 쉬운 방법: Netlify

1. `npm run build`를 실행합니다.
2. 생성된 `dist` 폴더를 Netlify의 Deploy 화면에 업로드합니다.
3. Netlify가 만들어준 주소를 휴대폰이나 다른 컴퓨터에서 접속하면 됩니다.

## 자동 배포용 설정

이 프로젝트에는 Netlify와 Vercel 설정이 들어 있습니다.

- Netlify: `netlify.toml`
- Vercel: `vercel.json`

GitHub에 올린 뒤 Netlify 또는 Vercel에 연결하면, 나중에 코드를 바꿀 때마다 자동으로 다시 배포할 수 있습니다.

## 주의

`http://127.0.0.1:5173` 주소는 이 컴퓨터에서만 켜지는 개발용 주소입니다. 컴퓨터가 꺼져도 접속되는 주소를 만들려면 Netlify, Vercel, GitHub Pages 같은 인터넷 호스팅에 배포해야 합니다.
