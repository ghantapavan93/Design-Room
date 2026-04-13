module Mutations
  class CreateDesign < BaseMutation
    description "Creates a new design with an initial empty state"

    argument :title, String, required: true
    argument :base_media_url, String, required: false
    argument :creator_name, String, required: true
    argument :participant_id, String, required: true

    field :design, Types::DesignType, null: true
    field :design_session_token, String, null: true
    field :success, Boolean, null: false
    field :errors, [String], null: false

    def resolve(title:, base_media_url: nil, creator_name:, participant_id:)
      design = Design.new(
        title: title,
        base_media_url: base_media_url
      )

      if design.save
        # Initialize empty state
        design.create_design_state!(
          state_json: {},
          last_saved_at: Time.current
        )

        # Create session
        token = SecureRandom.hex(16)
        session = design.design_sessions.create!(token: token)
        
        # Add creator to session as the first member with a verified participant_id
        session.session_members.create!(
          display_name: creator_name,
          participant_id: participant_id,
          role: 'contractor',
          permission: 'editor',
          last_seen_at: Time.current
        )

        {
          design: design,
          design_session_token: token,
          success: true,
          errors: []
        }
      else
        {
          design: nil,
          design_session_token: nil,
          success: false,
          errors: design.errors.full_messages
        }
      end
    end
  end
end
