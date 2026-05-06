module Types
  class DesignType < Types::BaseObject
    field :id, ID, null: false
    field :title, String, null: true
    field :homeowner_name, String, null: true
    field :address, String, null: true
    field :status, String, null: true
    field :cover_image_url, String, null: true
    field :base_media_url, String, null: true
    field :masks_url_prefix, String, null: true
    field :final_version_id, Integer
    field :mask_ready, Boolean, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    
    field :project_messages, [Types::ProjectMessageType], null: false
    field :region_locks, [Types::RegionLockType], null: false
    field :region_comments, [Types::RegionCommentType], null: false
    field :elements, [Types::ElementType], null: false
    field :design_exports, [Types::DesignExportType], null: false
    field :share_links, [Types::ShareLinkType], null: false
    
    field :state, Types::DesignStateType, null: true
    field :versions, [Types::DesignVersionType], null: false
    field :recent_events, [Types::DesignEventType], null: false do
      argument :limit, Integer, required: false, default_value: 50
      argument :after_id, Integer, required: false
    end

        
    def design_exports
      scope = object.design_exports.order(created_at: :desc)
      scope = scope.where(design_workspace_id: context[:workspace_id]) if context[:workspace_id]
      scope
    end

    def project_messages
      scope = object.project_messages
      scope = scope.where(design_workspace_id: context[:workspace_id]) if context[:workspace_id]
      scope
    end

    def region_locks
      scope = object.region_locks
      scope = scope.where(design_workspace_id: context[:workspace_id]) if context[:workspace_id]
      scope
    end

    def region_comments
      scope = object.region_comments
      scope = scope.where(design_workspace_id: context[:workspace_id]) if context[:workspace_id]
      scope
    end

    def state
      if context[:workspace_id]
        ws = object.design_workspaces.find_by(id: context[:workspace_id])
        if ws
          return OpenStruct.new(state_json: ws.state_json, last_event_id: ws.last_event_id)
        end
      end
      object.design_state
    end

    def versions
      scope = object.design_versions.order(created_at: :desc)
      scope = scope.where(design_workspace_id: context[:workspace_id]) if context[:workspace_id]
      scope
    end

    def share_links
      # Server-side filter: only active (not revoked, not expired), newest on top
      scope = object.share_links.active.order(created_at: :desc)
      scope = scope.where(design_workspace_id: context[:workspace_id]) if context[:workspace_id]
      scope
    end

    def recent_events(limit:, after_id: nil)
      scope = object.design_events.order(id: :desc)
      scope = scope.where('id > ?', after_id) if after_id
      scope = scope.where(design_workspace_id: context[:workspace_id]) if context[:workspace_id]
      scope.limit(limit)
    end
  end
end
