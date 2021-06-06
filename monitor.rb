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

  each_output 'ping 8.8.8.8' do |line|
    puts line

    internet_out = line.start_with? 'Request timeout for icmp_seq'

    output_file.write [Time.now.to_f].pack('e')

    if internet_out
      output_file.write [-1].pack('e')
    elsif line =~ /\d+ bytes from 8\.8\.8\.8: icmp_seq=\d+ ttl=\d+ time=(\d+(\.\d+)?) ms/
      latency = line.match(/time=(\d+(\.\d+)?) ms/)[1].to_f
      output_file.write [latency].pack('e')
    end

    output_file.flush
  end
end

