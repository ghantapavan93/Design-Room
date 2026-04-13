module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :design_session_token

    def connect
      self.design_session_token = request.params[:token]
      puts "ACTIONCABLE CONNECT - Token: #{self.design_session_token.inspect}"
      if design_session_token.present?
        puts "ACTIONCABLE CONNECT - Token: #{design_session_token}"
      else
        puts "ACTIONCABLE CONNECT - (Handshaking without token...)"
      end
    end
  end
end
