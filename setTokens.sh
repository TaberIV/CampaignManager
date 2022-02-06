export DISCORD_TOKEN=$(heroku config:get DISCORD_TOKEN -a campaign-mgr);
export NOTION_DATABASE_ID=$(heroku config:get NOTION_DATABASE_ID -a campaign-mgr);
export NOTION_TOKEN=$(heroku config:get NOTION_TOKEN -a campaign-mgr);

touch '.env'
echo "DISCORD_TOKEN='$(heroku config:get DISCORD_TOKEN -a campaign-mgr)'" > .env

echo "NOTION_DATABASE_ID='$(heroku config:get NOTION_DATABASE_ID -a campaign-mgr)'" >> .env

echo "NOTION_TOKEN='$(heroku config:get NOTION_TOKEN -a campaign-mgr)'" >> .env