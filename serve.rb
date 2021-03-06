require 'rubygems'
require 'sinatra/base'
require 'sinatra-websocket'
require 'sinatra/cross_origin'

require_relative 'monitor'

$sockets = []
$socket_lock = Mutex.new

class App < Sinatra::Base
  set :public_folder, 'build'
  set :server, 'thin'
  set :bind, '0.0.0.0'

  configure do
    enable :cross_origin
  end

  before do
    response.headers['Access-Control-Allow-Origin'] = '*'
  end

  get '/' do
    next send_file File.join('build', 'index.html') unless request.websocket?

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

  get '/historical-data' do
    send_file File.join('data', 'internet_status.bin')
  end

  get '/historical-data-index' do
    send_file File.join('data', 'internet_status_index.bin')
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
