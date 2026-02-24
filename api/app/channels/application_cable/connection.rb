module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :design_session_token

    def connect
      self.design_session_token = request.params[:token]
      reject_unauthorized_connection unless design_session_token
    end
  end
end
