require 'chunky_png'

input_path = '../web/public/demo/craftsman/mask_windows.png'
output_dir = '../web/public/demo/craftsman/'

puts "Loading image: #{input_path}"
img = ChunkyPNG::Image.from_file(input_path)

width = img.width
height = img.height

visited = Array.new(width) { Array.new(height, false) }
components = []

# Helper to check if a pixel is non-transparent and passes alpha threshold
def is_valid?(img, x, y)
  ChunkyPNG::Color.a(img[x, y]) > 50 # Alpha threshold to prevent antialiasing noise
end

puts "Finding connected components..."

(0...width).each do |x|
  (0...height).each do |y|
    next if visited[x][y] || !is_valid?(img, x, y)
    
    # Start a new component (BFS)
    component = []
    queue = [[x, y]]
    visited[x][y] = true
    
    while !queue.empty?
      cx, cy = queue.shift
      component << [cx, cy]
      
      # 8-way Adjacency to ensure diagonal pixels in sketchy masks connect
      [[0,1], [1,0], [0,-1], [-1,0], [1,1], [-1,-1], [1,-1], [-1,1]].each do |dx, dy|
        nx, ny = cx + dx, cy + dy
        next if nx < 0 || nx >= width || ny < 0 || ny >= height
        next if visited[nx][ny]
        
        if is_valid?(img, nx, ny)
          visited[nx][ny] = true
          queue << [nx, ny]
        end
      end
    end
    
    # Minimum area filter so tiny artifacts do not become elements
    components << component if component.size > 100
  end
end

puts "Found #{components.size} window instances."

# Sort components deterministically: top to bottom, then left to right
# To make it robust against slightly unaligned components, we can sort primarily by X (left to right)
# or primarily by Y (top to bottom).
# Let's sort left-to-right primarily, then top-to-bottom if they share an X boundary.
components.sort_by! do |comp|
  min_x = comp.map { |p| p[0] }.min
  min_y = comp.map { |p| p[1] }.min
  [min_x, min_y]
end

components.each_with_index do |comp, index|
  out_img = ChunkyPNG::Image.new(width, height, ChunkyPNG::Color::TRANSPARENT)
  
  comp.each do |x, y|
    out_img[x, y] = img[x, y]
  end
  
  out_file = "#{output_dir}window_#{index + 1}.png"
  out_img.save(out_file)
  puts "Saved #{out_file}"
end

puts "Done processing Craftsman windows!"
