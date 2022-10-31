FROM python:3.12-rc-slim-buster

ADD Get_Potential_Authors.py .
ENTRYPOINT ["python", "./Get_Potential_Authors.py"] 
