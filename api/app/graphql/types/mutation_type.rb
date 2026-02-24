module Types
  class MutationType < Types::BaseObject
    field :apply_material, mutation: Mutations::ApplyMaterial
    field :suggest_material, mutation: Mutations::SuggestMaterial
    field :approve_suggestion, mutation: Mutations::ApproveSuggestion
    field :reject_suggestion, mutation: Mutations::RejectSuggestion
    field :save_version, mutation: Mutations::SaveVersion
    field :restore_version, mutation: Mutations::RestoreVersion
    field :revert_event, mutation: Mutations::RevertEvent
    field :create_share_link, mutation: Mutations::CreateShareLink
    field :heartbeat, mutation: Mutations::Heartbeat
    field :mark_final_version, mutation: Mutations::MarkFinalVersion
    field :join_design_session, mutation: Mutations::JoinDesignSession
  end
end
