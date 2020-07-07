defmodule EbnisEmails.MixProject do
  use Mix.Project

  def project do
    [
      app: :ebnis_emails,
      version: "0.1.0",
      build_path: "../../_build",
      config_path: "../../config/config.exs",
      deps_path: "../../deps",
      lockfile: "../../mix.lock",
      elixir: "~> 1.9",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      test_coverage: [tool: ExCoveralls]
    ]
  end

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      extra_applications: [:logger]
    ]
  end

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      {:gen_smtp, "~> 0.14.0", override: true},
      {:swoosh, "~> 0.23.3"},
      {:mox, "~> 0.5.1", only: :test},
      {:cortex, "~> 0.6.0", only: [:dev, :test]}
    ]
  end
end
