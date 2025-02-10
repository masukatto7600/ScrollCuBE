const { html } = require("hono/html");

function layout(c, title, body) {
  return html`
    <!doctype html>
    <html>
      <head>
        <title>${title}</title>
        <link rel="icon" href="/images/favicon.ico">
        <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          integrity="sha256-fx038NkLY4U1TCrBDiu5FWPEa9eiZu01EiLryshJbCo="
          crossorigin="anonymous">
        <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
        <link rel="stylesheet" href="/stylesheets/style.css">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>
        <script>
          const encrypt = (src, key) => CryptoJS.AES.encrypt(src, key);

          const decrypt = (des, key) => {
            const decrypted = CryptoJS.AES.decrypt(des, key);
            const utf8 = decrypted.toString(CryptoJS.enc.Utf8);
            return utf8;
          };
        </script>
      </head>
      <body class="bg-info-subtle" data-bs-theme="light">
        ${body}
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          integrity="sha256-qlPVgvl+tZTCpcxYJFdHB/m6mDe84wRr+l81VoYPTgQ="
          crossorigin="anonymous"></script>
      </body>
    </html>
  `;
}

module.exports = layout;