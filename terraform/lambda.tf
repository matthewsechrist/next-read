# The Terraform file creates the Lambda function for GetVisitorCount

# Creates the Lambda function 
resource "aws_lambda_function" "GetVisitorCount_lambda_function" {
  function_name = data.aws_ssm_parameter.lambda_function_name.value

  s3_bucket     = data.aws_ssm_parameter.backup_bucket_name.value
  s3_key        = data.aws_ssm_parameter.lambda_s3_file.value

  handler       = data.aws_ssm_parameter.lambda_handler.value
  runtime       = data.aws_ssm_parameter.lambda_runtime.value

  role          = aws_iam_role.lambda_role.arn
  publish       = true
}
