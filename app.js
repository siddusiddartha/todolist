//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _=require("lodash");

const mongoose=require("mongoose");
mongoose.connect("mongodb+srv://admin-siddu:test-12@cluster0.wxuot.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemSchema={
  name: String
};
const Item=mongoose.model("Item",itemSchema);

const listSchema={
  name:String,
  items:[itemSchema]
};
const List=mongoose.model("List",listSchema);

const item1=new Item({
  name:"Welcome!"
});

const item2=new Item({
  name:"<- TO delete press this checkbox!"
});

const item3=new Item({
  name:"Start adding items!"
});

const defaultItems=[item1,item2,item3];

app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(!err){
          console.log("Successfully inserted");
        }
      })
      // res.redirect("/");
    }
    // else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    // }
  });
});


app.get("/custom/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        //Create a new List
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/custom/"+customListName);
      }
      else{
        //Show an existing list
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
      }
    }
    });
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
    const item=new Item({
      name:itemName
    });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/custom/"+listName);
    });
  }


});

app.post("/delete",function(req,res){

  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/custom/"+listName);
      }
    });
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server has started successfully");
});
