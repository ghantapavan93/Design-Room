module Types
  class ShareLinkType < Types::BaseObject
    field :id, ID, null: false
    field :design_id, Integer, null: false
    field :token, String, null: false
    field :mode, String, null: false
    field :permission, String
    
    field :design, Types::DesignType, null: false
    field :design_session_token, String, null: true

    def design_session_token
      if object.mode == 'live'
        # In a real app we might lookup or create a session here if it doesn't exist.
        # For simplicity, we create one for this specific load if needed.
        session = DesignSession.find_or_create_by!(design_id: object.design_id)
        session.token
      else
        nil
      end
    end
  end
end
