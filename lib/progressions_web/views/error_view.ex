defmodule ProgressionsWeb.ErrorView do
  use ProgressionsWeb, :view

  def render("404.html", _assigns) do
    render("404_page.html", %{})
  end

  def render("500.html", _assigns) do
    render("500_page.html", %{})
  end

  def template_not_found(template, _assigns) do
    Phoenix.Controller.status_message_from_template(template)
  end
end
