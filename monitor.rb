# frozen_string_literal: true

require 'open3'

def each_output(command)
  Open3.popen3(command) do |_stdin, stdout, stderr, thread|
    [stdout, stderr].each do |stream|
      Thread.new do
        line = ''
        yield line until (line = stream.gets).nil?
      end
    end

    thread.join
  end
end

def monitor
  output_file = File.open('data/internet_status.bin', 'a+b')

  File.open('data/internet_status_index.bin', 'a+b') do |index_file|
    index_file.write [Time.now.to_f].pack('e')
    index_file.write [File.size('data/internet_status.bin')].pack('L<')
  end

  each_output 'ping 8.8.8.8' do |line|
    puts line

    internet_out = line.start_with? 'Request timeout for icmp_seq'

    output_file.write [Time.now.to_f].pack('e')

    packet = nil

    if internet_out
      output_file.write [-1].pack('e')
      packet = { internet_status: 'offline' }
    elsif line =~ /\d+ bytes from 8\.8\.8\.8: icmp_seq=\d+ ttl=\d+ time=(\d+(\.\d+)?) ms/
      latency = line.match(/time=(\d+(\.\d+)?) ms/)[1].to_f
      output_file.write [latency].pack('e')

      if latency < 100
        packet = { internet_status: 'online', latency: latency }
      else
        packet = { internet_status: 'degraded', latency: latency }
      end
    end

    output_file.flush
    yield packet if block_given? && !packet.nil?
  end
end

