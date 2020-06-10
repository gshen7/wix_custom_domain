This repo contains a cloudflare worker skeleton that I used to allow a custom domain to map to a wixsite, without paying for a premium wix plan. This is done by using a cloudflare worker. It is based on fruitionsite.com, which similarly allows for custom domains to map to notion pages. Some specifics that were added in this repo for a wixsite were removing the wix banner, and allowing for buttons in to scroll to locations on the page as many wix pages are single page apps that use scrolling as navigation.

---

Something i'd like to see added that I don't have the time to add at the moment is the ability to make the anchors used for navigation be more human readable. An idea for doing this is to add a mapping from a human readable anchor to the non human readable anchors, and replacing the html elements with those non human readable anchors with a wrapper div with the human readable anchor as its id that contains the element with the non human readable id.

Also, contact forms wont work with this, but I dont have an idea for solving this just yet, other than calling your own emailing service.

--- 

If you found this helpful and want to support me, consider sponsoring me via (Venmo)[https://venmo.com/garyshen]/(Paypal)[paypal.me/GaryShen]

