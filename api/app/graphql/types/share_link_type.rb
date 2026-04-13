module Types
  class ShareLinkType < Types::BaseObject
    field :id, ID, null: false
    field :design_id, Integer, null: false
    field :token, String, null: false
    field :mode, String, null: false
    field :permission, String
    field :expires_at, GraphQL::Types::ISO8601DateTime, null: true
    field :revoked_at, GraphQL::Types::ISO8601DateTime, null: true
    field :last_accessed_at, GraphQL::Types::ISO8601DateTime, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    
    field :design, Types::DesignType, null: false
    field :design_session_token, String, null: true

    def design_session_token
      if object.mode == 'live'
        session = DesignSession.find_or_create_by!(design_id: object.design_id)
        session.token
      else
        nil
      end
    end
  end
end
