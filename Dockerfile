FROM python:3.12-rc-slim-buster
WORKDIR /next-read
COPY ./Get_Potential_Authors.py .
COPY ./requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN ["pytest"]
ENTRYPOINT [ "python","Get_Potential_Authors.py 140919874X" ]