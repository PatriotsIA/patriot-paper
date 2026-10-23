"""Reproducible CloudFormation definition; no credentials or personal data."""

def template():
    ref=lambda name:{'Ref':name}
    att=lambda name,field:{'Fn::GetAtt':[name,field]}
    sub=lambda value:{'Fn::Sub':value}
    resources={
      'Pledges':{'Type':'AWS::DynamoDB::Table','DeletionPolicy':'Retain','UpdateReplacePolicy':'Retain','Properties':{
        'BillingMode':'PAY_PER_REQUEST','AttributeDefinitions':[{'AttributeName':'pk','AttributeType':'S'},{'AttributeName':'sk','AttributeType':'S'}],
        'KeySchema':[{'AttributeName':'pk','KeyType':'HASH'},{'AttributeName':'sk','KeyType':'RANGE'}],
        'SSESpecification':{'SSEEnabled':True},'PointInTimeRecoverySpecification':{'PointInTimeRecoveryEnabled':True},
        'DeletionProtectionEnabled':True,'TimeToLiveSpecification':{'AttributeName':'expiresAt','Enabled':True}}},
      'Role':{'Type':'AWS::IAM::Role','Properties':{
        'AssumeRolePolicyDocument':{'Version':'2012-10-17','Statement':[{'Effect':'Allow','Principal':{'Service':'lambda.amazonaws.com'},'Action':'sts:AssumeRole'}]},
        'Policies':[{'PolicyName':'PledgeStorage','PolicyDocument':{'Version':'2012-10-17','Statement':[
          {'Effect':'Allow','Action':['dynamodb:GetItem','dynamodb:PutItem','dynamodb:UpdateItem','dynamodb:Query'],'Resource':att('Pledges','Arn')},
          {'Effect':'Allow','Action':['logs:CreateLogStream','logs:PutLogEvents'],'Resource':sub('arn:${AWS::Partition}:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/lambda/${AWS::StackName}:*')}
        ]}}]}},
      'LogGroup':{'Type':'AWS::Logs::LogGroup','Properties':{'LogGroupName':sub('/aws/lambda/${AWS::StackName}'),'RetentionInDays':30}},
      'Function':{'Type':'AWS::Lambda::Function','DependsOn':'LogGroup','Properties':{
        'FunctionName':ref('AWS::StackName'),'Runtime':'python3.13','Handler':'app.handler','Role':att('Role','Arn'),'Timeout':15,'MemorySize':256,
        'Code':{'S3Bucket':ref('CodeBucket'),'S3Key':ref('CodeKey')},
        'Environment':{'Variables':{'TABLE_NAME':ref('Pledges'),'ALLOWED_ORIGINS':{'Fn::Join':[',',ref('Origins')]}}}}},
      'Api':{'Type':'AWS::ApiGatewayV2::Api','Properties':{'Name':ref('AWS::StackName'),'ProtocolType':'HTTP',
        'CorsConfiguration':{'AllowOrigins':ref('Origins'),'AllowMethods':['GET','POST','OPTIONS'],'AllowHeaders':['content-type'],'MaxAge':600}}},
      'Integration':{'Type':'AWS::ApiGatewayV2::Integration','Properties':{'ApiId':ref('Api'),'IntegrationType':'AWS_PROXY','IntegrationUri':att('Function','Arn'),'PayloadFormatVersion':'2.0','TimeoutInMillis':15000}},
      'ReadRoute':{'Type':'AWS::ApiGatewayV2::Route','Properties':{'ApiId':ref('Api'),'RouteKey':'GET /counts','Target':{'Fn::Join':['/', ['integrations',ref('Integration')]]}}},
      'SupportersRoute':{'Type':'AWS::ApiGatewayV2::Route','Properties':{'ApiId':ref('Api'),'RouteKey':'GET /supporters','Target':{'Fn::Join':['/', ['integrations',ref('Integration')]]}}},
      'WriteRoute':{'Type':'AWS::ApiGatewayV2::Route','Properties':{'ApiId':ref('Api'),'RouteKey':'POST /pledges','Target':{'Fn::Join':['/', ['integrations',ref('Integration')]]}}},
      'Stage':{'Type':'AWS::ApiGatewayV2::Stage','DependsOn':['ReadRoute','WriteRoute','SupportersRoute'],'Properties':{'ApiId':ref('Api'),'StageName':'$default','AutoDeploy':True,
        'DefaultRouteSettings':{'ThrottlingBurstLimit':30,'ThrottlingRateLimit':15},
        'RouteSettings':{'POST /pledges':{'ThrottlingBurstLimit':10,'ThrottlingRateLimit':5,'DetailedMetricsEnabled':True}}}},
      'Permission':{'Type':'AWS::Lambda::Permission','Properties':{'Action':'lambda:InvokeFunction','FunctionName':ref('Function'),'Principal':'apigateway.amazonaws.com','SourceArn':sub('arn:${AWS::Partition}:execute-api:${AWS::Region}:${AWS::AccountId}:${Api}/*/*/*')}},
      'Alerts':{'Type':'AWS::SNS::Topic','DependsOn':'Function','Properties':{'DisplayName':'Patriots For Paper service alerts','Subscription':[{'Protocol':'email','Endpoint':'erik@patriotsinaction.com'}]}},
      'ApiErrors':{'Type':'AWS::CloudWatch::Alarm','Properties':{'AlarmDescription':'Patriots For Paper pledge API server errors','Namespace':'AWS/ApiGateway','MetricName':'5xx','Dimensions':[{'Name':'ApiId','Value':ref('Api')}],'Statistic':'Sum','Period':300,'EvaluationPeriods':1,'Threshold':3,'ComparisonOperator':'GreaterThanOrEqualToThreshold','TreatMissingData':'notBreaching','AlarmActions':[ref('Alerts')]}},
      'LambdaErrors':{'Type':'AWS::CloudWatch::Alarm','Properties':{'AlarmDescription':'Patriots For Paper pledge function errors','Namespace':'AWS/Lambda','MetricName':'Errors','Dimensions':[{'Name':'FunctionName','Value':ref('Function')}],'Statistic':'Sum','Period':300,'EvaluationPeriods':1,'Threshold':1,'ComparisonOperator':'GreaterThanOrEqualToThreshold','TreatMissingData':'notBreaching','AlarmActions':[ref('Alerts')]}}
    }
    return {'AWSTemplateFormatVersion':'2010-09-09','Description':'Patriots For Paper private pledges and public county counts',
      'Parameters':{'CodeBucket':{'Type':'String'},'CodeKey':{'Type':'String'},'Origins':{'Type':'CommaDelimitedList','Default':'https://main.d2pqbeealr8kyx.amplifyapp.com,https://patriotsforpaper.com,https://www.patriotsforpaper.com'}},
      'Resources':resources,'Outputs':{'ApiUrl':{'Value':att('Api','ApiEndpoint')},'TableName':{'Value':ref('Pledges')},'AlertsTopic':{'Value':ref('Alerts')}}}
