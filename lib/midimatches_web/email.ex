defmodule MidimatchesWeb.Email do
  @moduledoc """
  Provides email functionalities for interacting with email provider
  """
  alias MidimatchesWeb.Auth
  alias MidimatchesWeb.Router.Helpers, as: Routes

  alias SendGrid.{
    Email,
    Mail
  }

  require Logger

  @from_address "midimatches@gmail.com"

  def password_reset_email(recipient_email, username, user_id) do
    reset_slug = Auth.gen_reset_token(user_id)

    reset_link =
      MidimatchesWeb.Endpoint.url() <>
        Routes.page_path(MidimatchesWeb.Endpoint, :reset_password, reset_slug)

    Logger.info("sending password reset email for user_id=#{user_id} username=#{username}")

    body = reset_password_html(username, reset_link)

    Email.build()
    |> Email.add_to(recipient_email)
    |> Email.put_subject("Password Reset")
    |> Email.put_from(@from_address)
    |> Email.put_html(body)
    |> Mail.send()
  end

  @spec reset_password_html(String.t(), String.t()) :: String.t()
  def reset_password_html(username, reset_link) do
    """
    <div>
      <div>
        You have requested a password reset for your Midi Matches account (username: <strong>#{
      username
    }</strong>).
      </div>
      <br/>
      <div>
      Follow this link to reset your password:
        <a href='#{reset_link}'>
          #{reset_link}
        </a>
      </div>
      <br/>
      <div>
        For the sake of your account security, do <strong>NOT</strong> share this link with anyone. This link will expire in 6 hours.
      </div>
    </div>
    """
  end
end
