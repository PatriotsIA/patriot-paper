# patriotsforpaper.com domain connection

Prepared October 19, 2026. Amplify app `d2pqbeealr8kyx` in `us-west-2`, branch `main`.
Both `patriotsforpaper.com` and `www.patriotsforpaper.com` are associated with the app.
AWS status at preparation: `PENDING_VERIFICATION`. The domain is not live on Amplify yet.

## GoDaddy DNS entries

Authoritative DNS is currently `ns57.domaincontrol.com` / `ns58.domaincontrol.com`.
In GoDaddy → patriotsforpaper.com → Manage DNS, add:

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| CNAME | `_9faa2aba3f461dd0ef07d0ae8d5c0904` | `_22422ab66aa92ead1fc420b3f4d6a9ea.wzccmgtwzk.acm-validations.aws` | 1 hour |
| CNAME | `www` | `d2frs8r819o4ng.cloudfront.net` | 1 hour |

Keep the validation CNAME permanently so AWS can renew the certificate.

GoDaddy does not support apex ALIAS/ANAME records. To keep GoDaddy DNS,
configure Domain Forwarding for `patriotsforpaper.com` to
`https://www.patriotsforpaper.com`, without masking, once the `www` certificate
and hosting are active. Check both HTTP and HTTPS on the root domain after setup.
Do not create a CNAME at `@` or hard-code CloudFront IP addresses.

AWS documents the GoDaddy forwarding approach here:
https://docs.aws.amazon.com/amplify/latest/userguide/to-add-a-custom-domain-managed-by-godaddy.html

If the address must stay at the bare `patriotsforpaper.com`, migrate authoritative
DNS to a provider with apex aliases, such as Route 53. Export and reproduce the
complete existing DNS zone before any nameserver change; this is a separate
cutover from adding the two CNAME records above.

The domain currently has Microsoft 365 email. Preserve all MX, TXT, DKIM,
autodiscover and other non-web records; no email records were changed by this work.

## Verification after DNS changes

```bash
aws amplify get-domain-association \
  --app-id d2pqbeealr8kyx \
  --domain-name patriotsforpaper.com \
  --profile pia --region us-west-2 \
  --query 'domainAssociation.{status:domainStatus,reason:statusReason,subDomains:subDomains}'
```

Check certificate issuance, HTTPS, root forwarding and a direct visit to
`https://www.patriotsforpaper.com/action#pledge`. The forms use EmailJS;
if the EmailJS account restricts origins, add both custom HTTPS origins to its
Allowed Domains before accepting submissions. No real form submissions were
sent during the styling verification.
