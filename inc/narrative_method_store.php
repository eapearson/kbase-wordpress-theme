<?php
class NarrativeMethodStore {
  public function __construct($cfg) {
    $this->url = $cfg->url;
    $this->ch = curl_init();
    curl_setopt($this->ch, CURLOPT_URL, $this->url);
  }
  public function __destruct() {
    curl_close($this->ch);    
  }
  public function gen_id() {
    return preg_replace('/\./', '_', uniqid('gen_', true));
  }
  public function jsonrpc_send($header, $method, $kbparams=null) {
    if (!$kbparams) {
      $kbparams = (object)[];
    }
    curl_setopt($this->ch, CURLOPT_POST, true);
    array_push($header, 'Content-Type: application/json'); 
    curl_setopt($this->ch, CURLOPT_HTTPHEADER, $header);
    # uncomment for http diagnostics    
    # curl_setopt($this->ch, CURLOPT_VERBOSE, true);
    $id = $this->gen_id();
    $req = (object)[
      'method' => 'NarrativeMethodStore.'.$method,
      'params' => [$kbparams],
      'id' => $id
    ];
    $postContent = json_encode($req, JSON_PRETTY_PRINT);
    curl_setopt($this->ch, CURLOPT_POSTFIELDS, $postContent);
    curl_setopt($this->ch, CURLOPT_RETURNTRANSFER, 1);
    $response = curl_exec($this->ch);
    $json = json_decode($response);
    return $json;
  }

  # Mirror the jsonrpc api.

  public function ver() {
    $resp = $this->jsonrpc_send([], 'ver');
    return $resp;
  }
   
  public function status() {
    $resp = $this->jsonrpc_send([], 'status');
    return $resp;
  }
   
  # Method methods
  // Don't worry about params for now.
  public function list_methods() {
    $resp = $this->jsonrpc_send([], 'list_methods');;
    return $resp;
  }
   
  public function list_methods_full_info() {
    $resp = $this->jsonrpc_send([], 'list_methods_full_info');
    return $resp->result[0];
  }
   
  public function list_methods_spec() {
    $resp = $this->jsonrpc_send([], 'list_methods_spec');
    // check version and error
    return $resp->result[0];
  }

  public function get_method_full_info($methodIds) {
    if (gettype($methodIds) === 'string') {
      $methodIds = [$methodIds];
    }
    $resp = $this->jsonrpc_send([], 'get_method_full_info', (object)['ids' => $methodIds]);
    # var_dump($resp);
    return $resp->result[0][0];
  }
   
  # App methods
  
  public function list_apps_spec() {
    $resp = $this->jsonrpc_send([], 'list_apps_spec'); 
    $specs = $resp->result[0];
    return $specs;
  }
  
  public function list_apps_full_info() {
    $resp = $this->jsonrpc_send([], 'list_apps_full_info'); 
    $specs = $resp->result[0];
    return $specs;
  }
  
  public function get_app_spec($appIds) {
    if (gettype($appIds) === 'string') {
      $appIds = [$appIds];
    }
    $resp = $this->jsonrpc_send([], 'get_app_spec', (object)['ids' => $appIds]);
    # TODO: handle errors
    $appSpec = $resp->result[0][0];
    return $appSpec;
  }
  
  public function get_app_full_info($appIds) {
    if (gettype($appIds) === 'string') {
      $appIds = [$appIds];
    }
    $resp = $this->jsonrpc_send([], 'get_app_full_info', (object)['ids' => $appIds]);
    # TODO: handle errors
    $appSpec = $resp->result[0][0];
    return $appSpec;
  }
  
  public function get_method_spec($methodIds) {
    if (gettype($methodIds) === 'string') {
      $methodIds = [$methodIds];
    }
    $resp = $this->jsonrpc_send([], 'get_method_spec', (object)['ids' => $methodIds]);
    # TODO: handle errors
    $methodSpec = $resp->result[0][0];
    return $methodSpec;
  }
}