require 'rubygems'
require 'sinatra/base'
require 'sinatra-websocket'

require_relative 'monitor'

$sockets = []
$socket_lock = Mutex.new

class App < Sinatra::Base
  set :public_folder, 'build'

  get '/' do
    send_file File.join('build', 'index.html')
  end

  get 'ws' do
    request.websocket do |ws|
      ws.onopen do
        $socket_lock.synchronize do
          $sockets << ws
        end
      end

      ws.onclose do
        $socket_lock.synchronize do
          $sockets.delete(ws)
        end
      end
    end
  end
end

app_thread = Thread.new do
  App.run!
end

worker_thread = Thread.new do
  monitor do |packet|
    $socket_lock.synchronize do
      $sockets.each do |ws|
        ws.send JSON.generate(packet.merge(type: 'internet_status'))
      end
    end
  end
end

[app_thread, worker_thread].each(&:join)
