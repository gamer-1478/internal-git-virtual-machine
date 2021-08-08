#/usr/bin/python3
import sys
import time
import subprocess
from subprocess import Popen
import os
from os import path
import time
import json

# total arguments
n = len(sys.argv)

node_repo = str(sys.argv[1])
node_repo = node_repo.replace("'","")

node_dir = "/home/git/repositories/"+node_repo+".git"#/home/git/gitolite/repo/
port = str(sys.argv[2])
port = port.replace("'","")

username = str(sys.argv[3])
username = username.replace("'","")

checkout = str(sys.argv[4])
checkout = checkout.replace("'","")

print(node_dir, port)
if not os.path.exists('/home/tsadmin/deploys'):
    subprocess.Popen("mkdir deploys", cwd="/home/tsadmin/", shell=True) #/home/displicare/username

if not os.path.exists('/home/tsadmin/deploys/'+username):
    subprocess.Popen("mkdir "+username, cwd="/home/tsadmin/deploys/", shell=True) #/home/displicare/username

if not os.path.exists("/home/tsadmin/deploys/"+username+'/'+"displicare-logs"):
    subprocess.Popen("mkdir displicare-logs", cwd="/home/tsadmin/deploys/"+username, shell=True) #/home/displicare/username

subprocess.Popen("sudo rm -f "+node_repo+".txt", cwd="/home/tsadmin/deploys/"+username, shell=True) #/home/displicare/username
time.sleep(1)
subprocess.Popen("sudo touch "+node_repo+".txt", cwd="/home/tsadmin/deploys/"+username, shell=True) #/home/displicare/username
time.sleep(1)
logs = open("/home/tsadmin/deploys/"+username+"/"+node_repo+".txt", 'a+')

with open("/home/tsadmin/deploys/"+username+"/"+node_repo+".json") as f:
    data = json.load(f)
    if(data['pid'] != 0):
        subprocess.Popen("sudo kill "+str(data['pid']), cwd="/home/tsadmin/deploys/"+username, shell=True, stdout=logs, stderr=logs) #/home/displicare/username
time.sleep(1)

if os.path.exists('/home/tsadmin/deploys/'+username+'/'+node_repo):
    subprocess.Popen("sudo rm -rf "+node_repo, cwd="/home/tsadmin/deploys/"+username, shell=True, stdout=logs, stderr=logs) #/home/displicare/username
    time.sleep(2)
    b = subprocess.Popen("git clone "+node_dir, cwd="/home/tsadmin/deploys/"+username, shell=True, stdout=logs, stderr=logs)
    time.sleep(2)
    print(b.poll())
    if b.poll() != None:
        time.sleep(2)
        subprocess.Popen("git checkout "+checkout, cwd="/home/tsadmin/deploys/"+username+'/'+node_repo, shell=True, stdout=logs, stderr=logs)
        time.sleep(3)
    subprocess.Popen("npm install", cwd="/home/tsadmin/deploys/"+username+'/'+node_repo, shell=True, stdout=logs, stderr=logs)
    time.sleep(10)
    c = subprocess.Popen("npm install", cwd="/home/tsadmin/deploys/"+username+'/'+node_repo, shell=True, stdout=logs, stderr=logs)
    while c.poll() == None:
        time.sleep(1)

    print(c.poll())
    while c.poll() != None:
        node = subprocess.Popen('PORT='+port+" " + "npm start", cwd="/home/tsadmin/deploys/"+username+'/'+node_repo, shell=True, stdout=logs, stderr=logs)
        with open("/home/tsadmin/deploys/"+username+"/"+node_repo+".json") as f:
            data = json.load(f)
            data['pid'] = node.pid
            with open("/home/tsadmin/deploys/"+username+"/"+node_repo+".json", 'w') as json_file:
                json.dump(data, json_file)
                json_file.close()
                f.close()
            print(data)
            break
else:
    b = subprocess.Popen("git clone "+node_dir, cwd="/home/tsadmin/deploys/"+username, shell=True, stdout=logs, stderr=logs)
    print(b.poll())
    if b.poll() != None:
        time.sleep(2)
        subprocess.Popen("git checkout "+checkout, cwd="/home/tsadmin/deploys/"+username+'/'+node_repo, shell=True, stdout=logs, stderr=logs)
        time.sleep(3)
    c = subprocess.Popen("npm install", cwd="/home/tsadmin/deploys/"+username+'/'+node_repo, shell=True, stdout=logs, stderr=logs)
    while c.poll() == None:
        time.sleep(1)

    print(c.poll())
    while c.poll() != None:
        node = subprocess.Popen('PORT='+port+" " + "npm start", cwd="/home/tsadmin/deploys/"+username+'/'+node_repo, shell=True, stdout=logs, stderr=logs)
        with open("/home/tsadmin/deploys/"+username+"/"+node_repo+".json") as f:
            data = json.load(f)
            data['pid'] = node.pid
            with open("/home/tsadmin/deploys/"+username+"/"+node_repo+".json", 'w') as json_file:
                json.dump(data, json_file)
                json_file.close()
                f.close()
            print(data)
            break

logs.close()