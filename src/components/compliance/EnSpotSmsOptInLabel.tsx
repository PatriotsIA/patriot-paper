import { Link } from 'react-router-dom'

type Props = {
  organizationName: string
  purposePhrase: string
}

/** EnSpot Political worksheet–style disclaimer for phone/email opt-in forms. */
export function EnSpotSmsOptInLabel({ organizationName, purposePhrase }: Props) {
  const linkClass =
    'font-semibold text-patriot-blue underline decoration-patriot-blue/30 underline-offset-2 hover:decoration-patriot-blue/60'

  return (
    <>
      By providing your telephone number and email, you consent to receive {purposePhrase} messages and calls from{' '}
      <strong className="font-semibold text-patriot-navy">{organizationName}</strong>, including pre-recorded messages and
      via automated methods. Msg &amp; data rates may apply. Msg frequency may vary. Reply &quot;STOP&quot; to opt-out and
      &quot;HELP&quot; for help. View our{' '}
      <Link className={linkClass} to="/privacy" target="_blank" rel="noopener noreferrer">
        Privacy Policy
      </Link>{' '}
      and{' '}
      <Link className={linkClass} to="/terms" target="_blank" rel="noopener noreferrer">
        Terms &amp; Conditions
      </Link>{' '}
      for more information.
    </>
  )
}
