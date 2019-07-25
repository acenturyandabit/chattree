import subprocess
try:
  subprocess.Popen(["rm", "package.zip"]).communicate()
  subprocess.check_call(["7z", "a","package.zip", "./chrome_extension/*"])
except subprocess.CalledProcessError:
  # There was an error - command exited with non-zero code
  print ("This utility relies on 7zip. Please install 7zip to continue.")