module Types
  class MutationType < Types::BaseObject
    field :create_design_workspace, mutation: Mutations::CreateDesignWorkspace
    field :create_design, mutation: Mutations::CreateDesign
    field :apply_material, mutation: Mutations::ApplyMaterial
    field :suggest_material, mutation: Mutations::SuggestMaterial
    field :approve_suggestion, mutation: Mutations::ApproveSuggestion
    field :reject_suggestion, mutation: Mutations::RejectSuggestion
    field :save_version, mutation: Mutations::SaveVersion
    field :restore_version, mutation: Mutations::RestoreVersion
    field :revert_event, mutation: Mutations::RevertEvent
    field :add_region_comment, mutation: Mutations::AddRegionComment
    field :toggle_region_lock, mutation: Mutations::ToggleRegionLock
    field :add_project_message, mutation: Mutations::AddProjectMessage
    field :create_share_link, mutation: Mutations::CreateShareLink
    field :heartbeat, mutation: Mutations::Heartbeat
    field :mark_final_version, mutation: Mutations::MarkFinalVersion
    field :unlock_design, mutation: Mutations::UnlockDesign
    field :join_design_session, mutation: Mutations::JoinDesignSession
    field :resolve_region_comment, mutation: Mutations::ResolveRegionComment
    field :revoke_share_link, mutation: Mutations::RevokeShareLink
    field :record_export, mutation: Mutations::RecordExport
  end
end
