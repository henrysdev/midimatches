# defmodule Progressions.Rooms.Room.Server do
#   @moduledoc """
#   Genserver process for maintaining game server state
#   """
#   use GenServer
#   use TypedStruct
#   require Logger

#   alias Progressions.{
#     Pids,
#     Types.Configs.ServerConfig,
#     Types.Loop,
#     Types.Musician,
#     Utils
#   }

#   @type id() :: String.t()

#   # TODO move to config
#   @default_max_rounds 3

#   typedstruct do
#     # static state
#     field(:room_id, String.t(), enforce: true)
#     field(:room_start_utc, integer(), enforce: true)
#     field(:timestep_us, integer(), enforce: true)
#     field(:quantization_threshold, float(), enforce: true)
#     field(:max_rounds, integer(), default: @default_max_rounds)

#     # dynamic state
#     field(:view, String.t())
#     field(:musicians, %{required(id()) => %Musician{}})
#     field(:round, integer())
#     field(:scores, %{required(id()) => integer()})
#   end

#   @spec start_link(any) :: :ignore | {:error, any} | {:ok, pid}
#   def start_link(args) do
#     GenServer.start_link(__MODULE__, args)
#   end

#   @impl true
#   @spec init(any) :: {:ok, %__MODULE__{}}
#   def init(args) do
#     {room_id, server_config} =
#       case args do
#         [room_id] -> {room_id, %ServerConfig{}}
#         [room_id, server_config] -> {room_id, server_config}
#       end

#     Pids.register({:server, room_id}, self())

#     # configure musicians map
#     musicians_map =
#       server_config.musicians
#       |> Enum.reduce(%{}, fn %Musician{} = elem, acc ->
#         Map.put(acc, elem.musician_id, elem)
#       end)

#     {:ok,
#      %__MODULE__{
#        room_id: room_id,
#        room_start_utc: :os.system_time(:microsecond),
#        timestep_us: server_config.timestep_us,
#        quantization_threshold: server_config.quantization_threshold,
#        musicians: musicians_map
#      }}
#   end

#   ## Callbacks

#   @impl true
#   def handle_call(:get_musicians, _from, %__MODULE__{musicians: musicians_map} = state)
#       when is_map(musicians_map) do
#     musicians =
#       musicians_map
#       |> Map.values()
#       |> Enum.sort_by(& &1.musician_id, :asc)

#     {:reply, musicians, state}
#   end

#   @impl true
#   def handle_call(:get_start_time, _from, %__MODULE__{room_start_utc: start_time} = state) do
#     {:reply, start_time, state}
#   end

#   @spec handle_cast({:add_musician, %Musician{}}, %__MODULE__{}) :: {:noreply, %__MODULE__{}}
#   @impl true
#   def handle_cast(
#         {:add_musician, musician = %Musician{musician_id: musician_id}},
#         %__MODULE__{musicians: musicians_map} = state
#       ) do
#     # add musician to musicians map if not already there
#     musicians_map =
#       if Map.has_key?(musicians_map, musician_id) do
#         musicians_map
#       else
#         Map.put(musicians_map, musician_id, musician)
#       end

#     {:noreply, %__MODULE__{state | musicians: musicians_map}}
#   end

#   @spec handle_cast({:update_musician_loop, %Loop{}, id()}, %__MODULE__{}) ::
#           {:noreply, %__MODULE__{}}
#   @impl true
#   def handle_cast(
#         {:update_musician_loop,
#          loop = %Loop{start_timestep: loop_start_timestep, length: loop_length}, musician_id},
#         %__MODULE__{
#           room_id: room_id,
#           room_start_utc: room_start_utc,
#           timestep_us: timestep_us,
#           musicians: musicians_map
#         } = state
#       ) do
#     # update loop in musicians data structure
#     musicians_map =
#       if Map.has_key?(musicians_map, musician_id) do
#         Map.update!(musicians_map, musician_id, fn x -> %{x | loop: loop} end)
#       else
#         musicians_map
#       end

#     # determine deadline for clients to start playing
#     current_timestep = div(:os.system_time(:microsecond) - room_start_utc, timestep_us)
#     deadline_timestep = Utils.calc_deadline(current_timestep, loop_start_timestep, loop_length)

#     broadcast_message_to_channel(room_id, "broadcast_updated_musician_loop", %{
#       "musician_id" => musician_id,
#       "loop" => %Loop{loop | start_timestep: deadline_timestep}
#     })

#     {:noreply, %__MODULE__{state | musicians: musicians_map}}
#   end

#   @spec handle_cast({:update_musician, id(), map()}, %__MODULE__{}) ::
#           {:noreply, %__MODULE__{}}
#   @impl true
#   def handle_cast(
#         {:update_musician, musician_id, change_map},
#         %__MODULE__{musicians: musicians_map} = state
#       ) do
#     musicians_map =
#       if Map.has_key?(musicians_map, musician_id) do
#         change_map =
#           change_map
#           |> Map.to_list()
#           |> Enum.filter(fn {key, _val} ->
#             Map.has_key?(Map.from_struct(%Musician{musician_id: nil}), key)
#           end)
#           |> Map.new()

#         new_musician =
#           musicians_map
#           |> Map.get(musician_id)
#           |> Map.merge(change_map)

#         Map.put(musicians_map, musician_id, new_musician)
#       else
#         musicians_map
#       end

#     {:noreply, %__MODULE__{state | musicians: musicians_map}}
#   end

#   defp broadcast_message_to_channel(room_id, event, payload) do
#     ProgressionsWeb.Endpoint.broadcast("room:#{room_id}", event, payload)
#   end
# end
