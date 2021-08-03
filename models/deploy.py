import sys
import time
import subprocess
from subprocess import Popen
import os
from os import path
import time
# total arguments
n = len(sys.argv)

node_repo = str(sys.argv[1])
node_repo = node_repo.replace("'","")

node_dir = "git@git.displicare.us:"+node_repo #/home/git/gitolite/repo/
print(node_dir)
port = str(sys.argv[2])
port = port.replace("'","")

username = str(sys.argv[3])
username = username.replace("'","")

print(node_dir, port)
subprocess.Popen("mdir "+"/home/tsadmin/deploys/"+username, cwd="/home/tsadmin/deploys/", shell=True) #/home/displicare/username

subprocess.Popen("git clone "+node_dir, cwd="/home/tsadmin/deploys/"+username, shell=True) #/home/displicare/username
time.sleep(2)
subprocess.Popen("git checkout main", cwd="/home/tsadmin/deploys/"+username+node_repo, shell=True)
time.sleep(2)
subprocess.Popen("npm install", cwd="/home/tsadmin/deploys/"+username+node_repo, shell=True)
time.sleep(15)
subprocess.Popen('set PORT='+port+" && " + "npm start", cwd="/home/tsadmin/deploys/"+username+node_repo, shell=True)
time.sleep(2)