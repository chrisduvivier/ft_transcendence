#!/bin/bash
 
#Set the value of variable
database="test_1"
user_name="cduvivie"
password="password"

#Execute few psql commands: 
#Note: you can also add -h hostname -U username in the below commands.
psql -c "create database $database;"
psql -c "create user $user_name with encrypted password '$password';"
psql -c "grant all privileges on database $database to $user_name;"
 
# Test data
psql -d $database -c "CREATE TABLE public.tbl_students(rno integer, name character varying)"
psql -d $database -c "INSERT INTO public.tbl_students VALUES (1,'Anvesh'),(2,'Neevan'),(3,'Roy'),(4,'Martin'),(5,'Jenny')"
psql -d $database -c "SELECT *FROM public.tbl_students"
 
#Assign table count to variable
TableCount=$(psql -d $database -t -c "select count(1) from public.tbl_students")
 
#Print the value of variable
echo "Total table records count....:"$TableCount
