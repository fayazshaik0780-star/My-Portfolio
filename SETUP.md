# Portfolio setup

## Send contact messages to email

- Node.js and npm

The contact form sends submissions to `fayufayaz780@gmail.com` by default. It uses Gmail SMTP, so create a Google App Password for the sending Gmail account. App Passwords require 2-Step Verification. Use an App Password, not your normal Google password.

1. If you do not already have a `.env`, copy `.env.example` to `.env`. Otherwise, add the SMTP settings below to your existing `.env` without overwriting its other settings.
2. Set `SMTP_USER` to the full email address of the Google account that created the App Password, with no display name or spaces. Set `SMTP_PASS` to that account's 16-character App Password.
3. Keep `MAIL_TO` as `fayufayaz780@gmail.com`, or change it to the inbox where you want to receive messages.

Never put mail credentials in frontend code or share them in chat. `.env` is excluded from Git. For deployment, configure these same variables in your hosting provider's environment settings.

## Run

From the project directory, run:

```powershell
npm.cmd start
```

Open `http://localhost:3000`. Express serves the portfolio and contact API from the same origin.

The contact form submits to `POST /api/contacts`. The API validates each message and emails it to your inbox; it does not save messages to a database.

## Deploy to Netlify

The site is published from `public/`; Netlify routes `POST /api/contacts` to the serverless function in `netlify/functions`.

1. Import the `fayazshaik0780-star/My-Portfolio` repository in Netlify and deploy the `main` branch. Netlify reads the build and function settings from `netlify.toml`.
2. In the Netlify project's environment variables, add `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `MAIL_TO`. Use the same values as your private local `.env`; enter the App Password only in Netlify's secure settings, never in the repository or chat.
3. New Netlify projects may be private by default. In **Project configuration → General → Project visibility**, make production visibility public so visitors can open the site. Deploy previews can remain private.
4. Trigger a new deploy after adding the variables. Submit a test message from the deployed site and confirm it arrives in the configured inbox.
