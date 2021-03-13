import { PayPalButton } from "react-paypal-button-v2"
import * as React from "react"

export default function PaymentSection({
  level,
  hasAttemptedPayment,
  setHasAttemptedPayment,
  setSubmitting,
  dataIsValid,

  firebase,
  firstName,
  lastName,
  email,
  preferredLanguage,
  referrer,
  referrerDetail,
  timezone,

  setSuccess,
  setErrorData,
  setShowError,
  setRegistrationId,
}) {
  return (
    <div className="mt-10 sm:mt-0">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Payment
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Your payment for this class helps the Competitive Programming
              Initiative, a registered 501(c)(3) nonprofit organization, further
              its goal of promoting the field of competitive programming.
            </p>
          </div>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
              {!level && hasAttemptedPayment && (
                <p className="text-md text-red-800">
                  You must select a course above in order to register.
                </p>
              )}
              {!dataIsValid && hasAttemptedPayment && (
                <p className="text-md text-red-800">
                  {email.indexOf("@") == -1 &&
                    "Your email address is improperly formatted. "}
                  You must fill out all fields in order to register.
                </p>
              )}
              {(!hasAttemptedPayment || (level && dataIsValid)) && (
                <>
                  <p className="mt-1 text-sm text-gray-600">
                    To finalize your{" "}
                    {level && (
                      <b>
                        {level == "beginner" ? "Beginner" : "Intermediate"}{" "}
                        USACO Class{" "}
                      </b>
                    )}
                    registration, select a payment method below.
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Returns: If you are not satisfied with our classes, you may
                    cancel your class registration anytime before the{" "}
                    <b>second</b> class for a partial refund of <b>$90</b> by
                    emailing{" "}
                    <a
                      href={"mailto:classes@joincpi.org"}
                      className={"underline"}
                    >
                      classes@joincpi.org
                    </a>
                    .
                  </p>
                  {/*
                       //@ts-ignore */}
                  <PayPalButton
                    amount="100.00"
                    shippingPreference="NO_SHIPPING"
                    createOrder={(data, actions) => {
                      console.log(data, actions)
                      return actions.order.create({
                        purchase_units: [
                          {
                            amount: {
                              value: "100.00",
                              currency_code: "USD",
                              breakdown: {
                                item_total: {
                                  value: "100.00",
                                  currency_code: "USD",
                                },
                              },
                            },
                            items: [
                              {
                                name:
                                  (level == "beginner"
                                    ? "Beginner"
                                    : "Intermediate") + " USACO Class",
                                unit_amount: {
                                  value: "100.00",
                                  currency_code: "USD",
                                },
                                quantity: "1",
                              },
                            ],
                          },
                        ],
                      })
                    }}
                    onClick={(data, actions) => {
                      setHasAttemptedPayment(true)
                      if (!dataIsValid || !level) {
                        return false
                      }
                    }}
                    onError={() => {
                      setErrorData({
                        title: "Error: Unable to complete registration",
                        message: (
                          <>
                            <p>
                              We encountered an error while trying to complete
                              your registration. If this was unexpected, please
                              send us an email at{" "}
                              <a className={"text-blue-700 hover:underline"}>
                                classes@joincpi.org
                              </a>
                              , and include a screenshot of this page.
                            </p>
                            <p>
                              <b>Error Code PAYPAL_CATCHALL</b>
                            </p>
                          </>
                        ),
                      })
                      setShowError(true)
                    }}
                    onSuccess={(details, data) => {
                      setSubmitting(true)
                      firebase
                        .functions()
                        .httpsCallable("processClassRegistration")({
                          level,
                          firstName,
                          lastName,
                          email,
                          preferredLanguage,
                          referrer,
                          referrerDetail,
                          timezone,
                          orderData: data,
                        })
                        .then(data => {
                          setRegistrationId(data.registrationId)
                          setSuccess(true)
                          setSubmitting(false)
                        })
                        .catch(e => {
                          setErrorData({
                            title: "Error: Unable to complete registration",
                            message: (
                              <>
                                <p>
                                  We encountered an error while trying to
                                  complete your registration: {e.message}. If
                                  this was unexpected, please send us an email
                                  at{" "}
                                  <a
                                    className={"text-blue-700 hover:underline"}
                                  >
                                    classes@joincpi.org
                                  </a>
                                  , and include a screenshot of this page.
                                </p>
                                <p>
                                  <b>Order Details: </b>{" "}
                                  {JSON.stringify({
                                    data,
                                    e,
                                  })}
                                </p>
                              </>
                            ),
                          })
                          setShowError(true)

                          return
                        })
                    }}
                    options={{
                      disableFunding: "credit",
                      // sandbox id
                      clientId:
                        "AQs24h0QDn7C1l4penHhK7x3XbDTL9E5Dh-6FPz3HycxvRw22wiBdMo3UMftn2m1kOmiUcOVZUdzEWFL",
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
