defmodule EbnisWeb.Resolver.Experience do
  import Absinthe.Resolution.Helpers, only: [on_load: 2]

  alias EbnisWeb.Resolver
  alias Ebnis.Experiences

  @iso_extended_format "{ISO:Extended:Z}"

  def create(_, %{experience: attrs}, %{context: %{current_user: user}}) do
    case parse_fields(attrs.fields) do
      {:ok, fields} ->
        case attrs
             |> Map.merge(%{user_id: user.id, fields: fields})
             |> Experiences.create_experience() do
          {:ok, exp} ->
            {:ok, exp}

          {:error, failed_operation, changeset} ->
            {
              :error,
              Resolver.transaction_errors_to_string(changeset, failed_operation)
            }
        end

      error ->
        error
    end
  end

  defp parse_fields(fields) do
    try do
      fields =
        Enum.map(fields, fn field ->
          case parse_field(field) do
            {:ok, val} ->
              val

            error ->
              throw(error)
          end
        end)

      {:ok, fields}
    catch
      error ->
        error
    end
  end

  defp parse_field(field) do
    name = field.name
    type = field.type

    try do
      val =
        type
        |> parse_field(field[:value])
        |> Map.merge(%{name: name, type: Atom.to_string(type)})

      {:ok, val}
    rescue
      _ ->
        error =
          %{
            name: name,
            errors: %{value: "is invalid"}
          }
          |> Jason.encode!()

        {:error, error}
    end
  end

  defp parse_field(type, nil), do: Map.put(%{}, type, nil)
  defp parse_field(:integer, val), do: %{integer: String.to_integer(val)}
  defp parse_field(:date, val), do: %{date: Date.from_iso8601!(val)}

  defp parse_field(:datetime, val),
    do: %{datetime: Timex.parse!(val, @iso_extended_format)}

  defp parse_field(:decimal, val), do: %{decimal: String.to_float(val)}
  defp parse_field(:single_line_text, val), do: %{single_line_text: val}
  defp parse_field(:multi_line_text, val), do: %{multi_line_text: val}

  def get_experience(_, %{experience: %{id: id}}, %{context: %{current_user: user}}) do
    case Experiences.get_experience(id, user.id) do
      nil ->
        {:error, "Experience does not exist"}

      exp ->
        {:ok, exp}
    end
  end

  def get_experience(_, _, _) do
    {:error, Resolver.unauthorized()}
  end

  def get_experiences(_, _, _) do
  end

  def fields(%{} = experience, _, %{context: %{loader: loader}}) do
    loader
    |> Dataloader.load(:data, :fields, experience)
    |> on_load(fn loader ->
      fields = Dataloader.get(loader, :data, :fields, experience)

      {:ok, fields}
    end)
  end
end
