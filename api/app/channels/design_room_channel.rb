class DesignRoomChannel < ApplicationCable::Channel
  def subscribed
    unless params[:design_id]
      reject
      return
    end

    stream_from "design_room_#{params[:design_id]}"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
