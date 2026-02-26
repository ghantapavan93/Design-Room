module Types
  class DesignType < Types::BaseObject
    field :id, ID, null: false
    field :title, String, null: true
    field :homeowner_name, String, null: true
    field :address, String, null: true
    field :status, String, null: true
    field :cover_image_url, String, null: true
    field :final_version_id, Integer
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    
    field :state, Types::DesignStateType, null: true
    field :versions, [Types::DesignVersionType], null: false
    field :recent_events, [Types::DesignEventType], null: false do
      argument :limit, Integer, required: false, default_value: 50
      argument :after_id, Integer, required: false
    end

    def state
      object.design_state
    end

    def versions
      object.design_versions.order(created_at: :desc)
    end

    def recent_events(limit:, after_id: nil)
      scope = object.design_events.order(id: :desc)
      scope = scope.where('id > ?', after_id) if after_id
      scope.limit(limit)
    end
  end
end
