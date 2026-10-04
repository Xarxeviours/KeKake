# AdSense setup

The supplied publisher script is loaded once in the document head. The existing advertisement areas are prepared for responsive display ads below the landing-page hero, between landing-page sections, below the dashboard summary, and below settlement results. They remain separate from expense forms and calculator controls.

The publisher script alone does not identify a display ad unit. Until an ad-unit ID is configured, these areas show a neutral advertisement placeholder and do not make manual ad requests.

To activate the prepared areas:

1. In AdSense, open **Ads → By ad unit**, then create a responsive display ad unit or get the code for an existing one.
2. Copy the numeric value of `data-ad-slot` from the ad-unit code. Do not use the publisher ID as the ad-unit ID.
3. Set `VITE_ADSENSE_AD_SLOT` in the site's Netlify environment variables and redeploy. This public identifier is included in the frontend at deploy time. The same display unit is used in all four existing placements.
4. Keep Auto ads disabled in AdSense if ads should appear only in these designated areas. The website script does not control the account's Auto ads setting.

Ad display also depends on AdSense approval, available inventory, browser blocking, and applicable consent requirements. Configure any required consent messages in AdSense before serving ads.
