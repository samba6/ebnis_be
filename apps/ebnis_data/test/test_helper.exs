Absinthe.Test.prime(EbnisData.Schema)
Faker.start()
# ExUnit.start(exclude: [db: true])
ExUnit.start()
Ecto.Adapters.SQL.Sandbox.mode(EbnisData.Repo, :manual)