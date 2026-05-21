#!/bin/bash
# Script deploy rapido — B&B Arco Gentile
# Uso: ./deploy.sh "descrizione modifica"

MSG=${1:-"Update sito"}

git add -A
git commit -m "$MSG"
git push https://Berootstudio:$(cat ~/.arco_token)@github.com/Berootstudio/arcogentile.git main

echo ""
echo "✅ Deploy completato! → https://arcogentile.it"
