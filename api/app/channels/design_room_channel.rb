class DesignRoomChannel < ApplicationCable::Channel
  def subscribed
    puts "SUBSCRIBING TO DESIGN_ROOM - params: #{params.inspect}, token: #{design_session_token.inspect}"
    unless params[:design_id]
      puts "REJECT: NO DESIGN ID"
      reject
      return
    end

    # Critical Cross-Session Isolation Check:
    # ActionCable identifies the connection by :design_session_token (set in connection.rb)
    # We must ensure that this token actually belongs to the design being subscribed to.
    unless DesignSession.exists?(design_id: params[:design_id], token: design_session_token)
      puts "REJECT: INVALID TOKEN FOR DESIGN #{params[:design_id]}"
      reject
      return
    end

    puts "SUBSCRIBE SUCCESS: design_room_#{params[:design_id]}"
    stream_from "design_room_#{params[:design_id]}"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
