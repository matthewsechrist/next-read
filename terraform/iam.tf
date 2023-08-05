# This Terraform file creates the IAM policies and roles

# Creates the IAM role which dictates what other AWS services the Lambda function may access
resource "aws_iam_role" "lambda_role" {
  name               = "lambda-role"
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
          "appsync.amazonaws.com"
        ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}


# Creates the Lambda policy to restrict to one DynamoDB table for only PUTs, GETs, and UPDATEs
resource "aws_iam_policy" "GetUpdateVisitorsPolicy" {
  name        = "GetUpdateVisitorsPolicy"
  description = "GetUpdateVisitorsPolicy"

  policy = <<POL
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "GetUpdateVisitorsPolicy",
            "Effect": "Allow",
            "Action": [
                "dynamodb:PutItem",
                "dynamodb:GetItem",
                "dynamodb:UpdateItem"
            ],
            "Resource": "arn:aws:dynamodb:${data.aws_ssm_parameter.my_region.value}:${data.aws_ssm_parameter.account_id.value}:table/${data.aws_ssm_parameter.dynamodb_table.value}"
        },
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
            "Resource": "arn:aws:lambda:${data.aws_ssm_parameter.my_region.value}:${data.aws_ssm_parameter.account_id.value}:function:${data.aws_ssm_parameter.lambda_function_name.value}"
        }
    ]
}
POL
}

# Attaches the Lambda policy to the role for Lambda function call
resource "aws_iam_role_policy_attachment" "lambda-role-attach" {
  role        = aws_iam_role.lambda_role.name
  policy_arn  = aws_iam_policy.GetUpdateVisitorsPolicy.arn
}

# Creates the policy for access to GraphQL API resource
resource "aws_iam_role_policy" "visitor_counter_role_policy" {
  name        = "visitor_counter_role_policy"
  role        = aws_iam_role.visitor_counter_role.id

  policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [
      {
        "Action" : [
          "appsync:GraphQL"
        ],
        "Resource" : [
          "arn:aws:appsync:${data.aws_ssm_parameter.my_region.value}:${data.aws_ssm_parameter.account_id.value}:apis/${aws_appsync_graphql_api.appsync_visitor_counter_api.id}/*"
        ],
        "Effect" : "Allow"
      }
    ]
    }
  )
}

# Creates the IAM role for the visitor counter API
resource "aws_iam_role" "visitor_counter_role" {
  name = data.aws_ssm_parameter.appsync_role_name.value

  assume_role_policy = jsonencode({
    Version       = "2012-10-17"
    Statement     = [
      {   
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Sid       = ""
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      },
    ]
  })
}
