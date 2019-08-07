defmodule EbnisData.Schema.Entry1 do
  use Absinthe.Schema.Notation
  use Absinthe.Relay.Schema.Notation, :modern

  import Absinthe.Resolution.Helpers, only: [dataloader: 1]

  alias EbnisData.Resolver.Entry1, as: EntryResolver
  alias EbnisData.Resolver

  @desc """
      An entry data object
  """
  object :entry_data do
    field(:id, :id)
    field(:data, non_null(:entry_field_json))
    field(:field_definition_id, :id)
  end

  @desc """
    An Experience entry that supports relay
  """
  node object(:entry1) do
    @desc ~S"""
      The ID of experience to which this entry belongs.
    """
    field :experience_id, non_null(:id) do
      resolve(fn root, _, _ ->
        {
          :ok,
          root.exp_id
          |> Resolver.convert_to_global_id(:experience1)
        }
      end)
    end

    @desc ~S"""
      The client ID which indicates that an entry has been created while server
      is offline and is to be saved with the server, the client ID uniquely
      identifies this entry and will be used prevent conflict while saving entry
      created while server offline.
    """
    field(:client_id, :id)

    @desc """
      The experience object to which this entry belongs
    """
    field(
      :experience,
      non_null(:experience),
      resolve: dataloader(:data)
    )

    @desc """
      The list of data belonging to this entry
    """
    field(
      :entry_data_list,
      :entry_data
      |> list_of()
      |> non_null(),
      resolve: dataloader(:data)
    )

    field(:inserted_at, non_null(:iso_datetime))
    field(:updated_at, non_null(:iso_datetime))
  end

  @desc ~S"""
    Entry data list error (errors field) while creating an entry
  """
  object :entry_data_list_error do
    field(:field_definition, :string)
    field(:field_definition_id, :string)
    field(:data, :string)
  end

  @desc ~S"""
    Entry data list errors while creating an entry
  """
  object :entry_data_list_errors do
    field(:index, non_null(:integer))
    field(:errors, non_null(:entry_data_list_error))
  end

  @desc ~S"""
    Object returned when entry created
  """
  object :entry_creation_return_value do
    field(:entry, :entry1)
    field(:errors, :create_entry_errors)
  end

  object :create_entry_errors do
    @desc ~S"""
      Did we fail because there are errors in the data list object?
    """
    field(:entry_data_list_errors, list_of(:entry_data_list_errors))

    @desc ~S"""
      Did we fail because, say, we did could not fetch the experience
    """
    field(:experience, :string)

    @desc ~S"""
      While saving an offline entry, its experience ID must be same as
      experience.clientId if saving entry via offline experience
    """
    field(:experience_id, :string)

    @desc ~S"""
      May be because client ID is not unique for experience
    """
    field(:client_id, :string)

    @desc ~S"""
      A catch-all field for when we are unable to create an entry
    """
    field(:entry, :string)
  end

  @desc ~S"""
    Error object returned if we are creating multiple entries simultaneously.
    This will be returned by a single entry which fails to save.
  """
  object :create_entries_errors do
    @desc ~S"""
      The client ID of the entry which fails to save
    """
    field(:client_id, non_null(:string))

    @desc ~S"""
      The experience ID of the entry which fails to save
    """
    field(:experience_id, non_null(:string))

    field(:errors, :create_entry_errors)
  end

  ############################# END OBJECTS ##################################

  ############################# INPUTS ##################################

  @desc ~S"""
    Variables for creating an entry field
  """
  input_object :create_entry_data do
    @desc ~S"""
      The experience definition ID for which the experience data is to be
      generated. If the associated experience of this entry has been created
      offline, then this field **MUST BE THE SAME** as
      `createEntryData.clientId` and will be rejected if not.
    """
    field(:field_definition_id, non_null(:id))

    @desc ~S"""
      The data of this entry. It is a JSON string of the form:

      ```json
        {date: '2017-01-01'}
        {integer: 4}
      ```
    """
    field(:data, non_null(:entry_field_json))
  end

  @desc """
    Variables for creating an experience entry
  """
  input_object :create_entry_input1 do
    @desc ~S"""
      The global ID of the experience or if the associated
      experience has been created offline, then this must be the same as the
      `experience.clientId` and will be enforced as such.
    """
    field(:experience_id, non_null(:id))

    @desc """
      The entry data list for the experience entry
    """
    field(
      :entry_data_list,
      :create_entry_data
      |> list_of()
      |> non_null()
    )

    @desc ~S"""
      Client id for entries created while server is offline and to be saved.
    """
    field(:client_id, :id)

    @desc """
      If entry is created on the client, it might include timestamps
    """
    field(:inserted_at, :iso_datetime)
    field(:updated_at, :iso_datetime)
  end

  ############################# END INPUTS ##################################

  ################### MUTATIONS #########################################

  @desc """
    Mutations allowed on Experience entry object
  """
  object :entry_mutations do
    @desc ~S"""
      Create an experience
    """
    field :create_entry1, :entry_creation_return_value do
      arg(:input, non_null(:create_entry_input1))

      resolve(&EntryResolver.create/2)
    end
  end

  ################### END MUTATIONS #########################################

  connection(node_type: :entry1)
end
