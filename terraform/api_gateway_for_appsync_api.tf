# This Terraform file creates the resources needed for visitor counter REST API. This API Gateway resource 
# sits in front of the AppSync/GraphQL API endpoint

resource "aws_api_gateway_rest_api" "visitor_counter_api" {
  name                         = "visitor_counter_api"

  disable_execute_api_endpoint = true

  endpoint_configuration {
    types                      = ["EDGE"]
  }
}

# Creates the visitor counter gateway resource
resource "aws_api_gateway_resource" "visitor_counter_gateway_resource" {
  parent_id                    = aws_api_gateway_rest_api.visitor_counter_api.root_resource_id
  path_part                    = data.aws_ssm_parameter.path_part.value
  rest_api_id                  = aws_api_gateway_rest_api.visitor_counter_api.id
}

# Need a POST method to call the GraphQL API
resource "aws_api_gateway_method" "visitor_counter_POST_method" {
  authorization                = "NONE"
  http_method                  = "POST"
  resource_id                  = aws_api_gateway_resource.visitor_counter_gateway_resource.id
  rest_api_id                  = aws_api_gateway_rest_api.visitor_counter_api.id
}

# Need an OPTIONS method for CORS to function properly
resource "aws_api_gateway_method" "visitor_counter_OPTIONS_method" {
  authorization                = "NONE"
  http_method                  = "OPTIONS"
  resource_id                  = aws_api_gateway_resource.visitor_counter_gateway_resource.id
  rest_api_id                  = aws_api_gateway_rest_api.visitor_counter_api.id
}

# OPTIONS method is set for CORS headers
resource "aws_api_gateway_method_response" "visitor_counter_OPTIONS_method_response" {
  rest_api_id                  = aws_api_gateway_rest_api.visitor_counter_api.id
  resource_id                  = aws_api_gateway_resource.visitor_counter_gateway_resource.id
  http_method                  = aws_api_gateway_method.visitor_counter_OPTIONS_method.http_method
  status_code                  = "200"
  response_models              = {
     
    "application/json"         = "Empty"
  }     
  response_parameters          = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
  depends_on                   = [aws_api_gateway_method.visitor_counter_OPTIONS_method]
}

# OPTIONS method integration set to the recommended choice of No Templates found
resource "aws_api_gateway_integration" "visitor_counter_OPTIONS_method_integration" {
  rest_api_id                  = aws_api_gateway_rest_api.visitor_counter_api.id
  resource_id                  = aws_api_gateway_resource.visitor_counter_gateway_resource.id
  http_method                  = aws_api_gateway_method.visitor_counter_OPTIONS_method.http_method
  type                         = "MOCK"
  depends_on                   = [aws_api_gateway_method.visitor_counter_OPTIONS_method]
       
  passthrough_behavior         = "WHEN_NO_TEMPLATES"
     
  request_templates            = {
    "application/json"         = jsonencode({
      statusCode               = 200
    })
  }
}

# OPTIONS method integration response set for CORS with the Allow Origin set to block other domains
resource "aws_api_gateway_integration_response" "visitor_counter_OPTIONS_method_integration_response" {
  rest_api_id                  = aws_api_gateway_rest_api.visitor_counter_api.id
  resource_id                  = aws_api_gateway_resource.visitor_counter_gateway_resource.id
  http_method                  = aws_api_gateway_method.visitor_counter_OPTIONS_method.http_method
  status_code                  = aws_api_gateway_method_response.visitor_counter_OPTIONS_method_response.status_code
     
  response_parameters          = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
    "method.response.header.Access-Control-Allow-Methods" = "'OPTIONS,POST'",
    "method.response.header.Access-Control-Allow-Origin"  = data.aws_ssm_parameter.allowed_origin.value,
  }

  depends_on = [aws_api_gateway_method_response.visitor_counter_OPTIONS_method_response]
  response_templates           = {
    "application/json"         = ""
  }
}

# POST method integration response set for CORS with the Allow Origin set to block other domains
resource "aws_api_gateway_integration_response" "visitor_counter_POST_method_integration_response" {
  rest_api_id                  = aws_api_gateway_rest_api.visitor_counter_api.id
  resource_id                  = aws_api_gateway_resource.visitor_counter_gateway_resource.id
  http_method                  = aws_api_gateway_method.visitor_counter_POST_method.http_method
  status_code                  = aws_api_gateway_method_response.visitor_counter_POST_method_response.status_code
     
  response_parameters          = {
    "method.response.header.Access-Control-Allow-Origin" = data.aws_ssm_parameter.allowed_origin.value
  }

  depends_on                   = [aws_api_gateway_method_response.visitor_counter_POST_method_response]
        
  response_templates           = {
    "application/json"         = ""
  }
}

# POST method response set for CORS Allow Origin
resource "aws_api_gateway_method_response" "visitor_counter_POST_method_response" {
  rest_api_id                  = aws_api_gateway_rest_api.visitor_counter_api.id
  resource_id                  = aws_api_gateway_resource.visitor_counter_gateway_resource.id
  http_method                  = aws_api_gateway_method.visitor_counter_POST_method.http_method
  status_code                  = "200"

  response_models = {
    "application/json"         = "Empty"
  }
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# POST method integration sets the URI to the GraphQL API endpoint with necessary header
resource "aws_api_gateway_integration" "visitor_counter_POST_method_integration" {
  http_method                  = aws_api_gateway_method.visitor_counter_POST_method.http_method
  resource_id                  = aws_api_gateway_resource.visitor_counter_gateway_resource.id
  rest_api_id                  = aws_api_gateway_rest_api.visitor_counter_api.id
  type                         = "AWS"
  integration_http_method      = "POST"

  # Seems hacky, but could not figure out another way to access the 'AWS Subdomain' underneath the AppSync Data Plane setting
  uri                          = "arn:aws:apigateway:${data.aws_ssm_parameter.my_region.value}:${split("https://", split(".", lookup(aws_appsync_graphql_api.appsync_visitor_counter_api.uris, "GRAPHQL"))[0])[1]}.appsync-api:path/graphql"

  credentials                  = "arn:aws:iam::${data.aws_ssm_parameter.account_id.value}:role/${data.aws_ssm_parameter.appsync_role_name.value}"

  request_parameters = {
    (data.aws_ssm_parameter.custom_header.value) = data.aws_ssm_parameter.custom_value.value
  }

  passthrough_behavior         = "WHEN_NO_TEMPLATES"
}

# Creates the gateway deployment for the visitor counter
resource "aws_api_gateway_deployment" "visitor_counter_deployment" {
  rest_api_id                  = aws_api_gateway_rest_api.visitor_counter_api.id

  triggers = {
    redeployment               = sha1(jsonencode([
      aws_api_gateway_resource.visitor_counter_gateway_resource.id,
      aws_api_gateway_method.visitor_counter_POST_method.id,
      aws_api_gateway_integration.visitor_counter_POST_method_integration.id,
    ]))
  }

  lifecycle {
    create_before_destroy      = true
  }
}

# Creates the stage for the visitor counter
resource "aws_api_gateway_stage" "visitor_counter_stage" {
  deployment_id                = aws_api_gateway_deployment.visitor_counter_deployment.id
  rest_api_id                  = aws_api_gateway_rest_api.visitor_counter_api.id
  stage_name                   = data.aws_ssm_parameter.appsync_stage_name.value
}

# Sets the custom domain of for the API endpoint
resource "aws_api_gateway_domain_name" "visitor_counter_domain_name" {
  regional_certificate_arn     = aws_acm_certificate_validation.create_certificate_validation.certificate_arn
  domain_name                  = data.aws_ssm_parameter.api_gateway_domain_name.value

  security_policy = "TLS_1_2"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# Maps the HTTP API endpoint to the custom domain name
resource "aws_api_gateway_base_path_mapping" "visitor_counter_base_path_mapping" {
  api_id                       = aws_api_gateway_rest_api.visitor_counter_api.id
  stage_name                   = aws_api_gateway_stage.visitor_counter_stage.stage_name
  domain_name                  = aws_api_gateway_domain_name.visitor_counter_domain_name.domain_name
}

