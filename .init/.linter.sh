#!/bin/bash
cd /home/kavia/workspace/code-generation/weather-now-212850-212865/weather_app_frontend
npm run lint
ESLINT_EXIT_CODE=$?
if [ $ESLINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

