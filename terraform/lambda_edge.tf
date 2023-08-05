# The Terraform file creates the Lambda function for adding Security Headers to CloudFront distribution

# Creates the Lambda function 
resource "aws_lambda_function" "SecurityHeaders_lambda_function" {
  function_name = data.aws_ssm_parameter.security_headers_function_name.value

  s3_bucket     = data.aws_ssm_parameter.backup_bucket_name.value
  s3_key        = data.aws_ssm_parameter.security_headers_function.value
    
  handler       = data.aws_ssm_parameter.security_headers_function_handler.value
  runtime       = data.aws_ssm_parameter.security_headers_function_runtime.value
    
  role          = aws_iam_role.security_headers_lambda_role.arn
  publish       = true
}

# Creates the IAM role which dictates what other AWS services the Lambda function may access
resource "aws_iam_role" "security_headers_lambda_role" {
  name               = "security_headers_lambda_role"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "LambdaPolicy",
      "Effect": "Allow",
      "Principal": {
        "Service": [
          "lambda.amazonaws.com"
        ]
      },
      "Action": "sts:AssumeRole"
    },
    {
      "Sid": "AppSyncPolicy",
      "Effect": "Allow",
      "Principal": {
        "Service": [
          "edgelambda.amazonaws.com"
        ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}


# Creates the Lambda policy to restrict to one DynamoDB table for only PUTs, GETs, and UPDATEs
resource "aws_iam_policy" "SecurityHeadersPolicy" {
  name        = "SecurityHeadersPolicy"
  description = "SecurityHeadersPolicy"

  policy = <<POL
{
    "Version": "2012-10-17",
    "Statement": [
       {
           "Sid": "ParameterStorePolicy",
           "Effect": "Allow",
           "Action": [
               "kms:Decrypt",
               "ssm:GetParameter"
           ],
           "Resource": [
               "arn:aws:ssm:*:${data.aws_ssm_parameter.account_id.value}:parameter/*",
               "arn:aws:kms:${data.aws_ssm_parameter.my_region.value}:${data.aws_ssm_parameter.account_id.value}:key/${data.aws_ssm_parameter.kms_key.value}"
           ]
       },
        {
            "Sid": "LambdaPolicy",
            "Effect": "Allow",
            "Action": [
                "lambda:InvokeFunction"
            ],
            "Resource": "arn:aws:lambda:${data.aws_ssm_parameter.my_region.value}:${data.aws_ssm_parameter.account_id.value}:function:${data.aws_ssm_parameter.security_headers_function_name.value}"
        },
        {
            "Effect": "Allow",
            "Action": "logs:CreateLogGroup",
            "Resource": "arn:aws:logs:${data.aws_ssm_parameter.my_region.value}:${data.aws_ssm_parameter.account_id.value}:*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": [
                "arn:aws:logs:${data.aws_ssm_parameter.my_region.value}:${data.aws_ssm_parameter.account_id.value}:log-group:/aws/lambda/${data.aws_ssm_parameter.security_headers_function_name.value}:*"
            ]
        }
    ]
}
POL
}

# Attaches the Lambda policy to the role for Lambda function call
resource "aws_iam_role_policy_attachment" "security_headers_lambda_role_attach" {
  role       = aws_iam_role.security_headers_lambda_role.name
  policy_arn = aws_iam_policy.SecurityHeadersPolicy.arn
}
