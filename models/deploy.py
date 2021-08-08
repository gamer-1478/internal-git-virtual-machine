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

node_dir = "/home/git/repositories/"+node_repo+".git"#/home/git/gitolite/repo/
port = str(sys.argv[2])
port = port.replace("'","")

username = str(sys.argv[3])
username = username.replace("'","")

print(node_dir, port)
if not os.path.exists('/home/tsadmin/deploys'):
    subprocess.Popen("mkdir deploys", cwd="/home/tsadmin/", shell=True) #/home/displicare/username

if not os.path.exists('/home/tsadmin/deploys/'+username):
    subprocess.Popen("mkdir "+username, cwd="/home/tsadmin/deploys/", shell=True) #/home/displicare/username

if not os.path.exists("/home/tsadmin/deploys/"+username+'/'+"displicare-logs"):
    subprocess.Popen("mkdir displicare-logs", cwd="/home/tsadmin/deploys/"+username, shell=True) #/home/displicare/username

subprocess.Popen("sudo rm -f "+node_repo+".logs.txt", cwd="/home/tsadmin/deploys/"+username, shell=True) #/home/displicare/username
subprocess.Popen("sudo touch "+node_repo+".logs.txt", cwd="/home/tsadmin/deploys/"+username, shell=True) #/home/displicare/username

logs = "/home/tsadmin/deploys/"+username+"/"+node_repo+".logs.txt"
if os.path.exists('/home/tsadmin/deploys/'+username+'/'+node_repo):
    subprocess.Popen("sudo rm -rf "+node_repo + " > "+logs, cwd="/home/tsadmin/deploys/"+username, shell=True) #/home/displicare/username
    time.sleep(2)
    b = subprocess.Popen("git clone "+node_dir+ " > "+logs, cwd="/home/tsadmin/deploys/"+username, shell=True)
    time.sleep(2)
    print(b.poll())
    if b.poll() != None:
        time.sleep(2)
        subprocess.Popen("git checkout main"+ " > "+logs, cwd="/home/tsadmin/deploys/"+username+'/'+node_repo, shell=True)
        time.sleep(3)
    subprocess.Popen("npm install"+ " > "+logs, cwd="/home/tsadmin/deploys/"+username+'/'+node_repo, shell=True)
    time.sleep(10)
    subprocess.Popen('PORT='+port+" " + "npm start"+ " > "+logs, cwd="/home/tsadmin/deploys/"+username+'/'+node_repo, shell=True)
    time.sleep(5)
else:
    b = subprocess.Popen("git clone "+node_dir+ " > "+logs, cwd="/home/tsadmin/deploys/"+username, shell=True)
    print(b.poll())
    if b.poll() != None:
        time.sleep(2)
        subprocess.Popen("git checkout main"+ " > "+logs, cwd="/home/tsadmin/deploys/"+username+'/'+node_repo, shell=True)
        time.sleep(3)
    subprocess.Popen("npm install"+ " > "+logs, cwd="/home/tsadmin/deploys/"+username+'/'+node_repo, shell=True)
    time.sleep(10)
    subprocess.Popen('PORT='+port+" " + "npm start"+ " > "+logs, cwd="/home/tsadmin/deploys/"+username+'/'+node_repo, shell=True)
    time.sleep(5)
