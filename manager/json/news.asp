<!--#include file="../conn.asp" -->
<!--#include file="json.asp" -->
<% 

    dim edit, id, content, rs

    id = request("id")
    edit = request("edit")
    content = request("content")

    if content = "" then

        if edit = "" then
            set rs = conn.execute("select * from news order by create_time desc")
        else 
            set rs = conn.execute("select * from news where id = " & id)
        end if

        response.write json(rs)

    else

        set rs = conn.execute("select content, abstract from news where id = " & id)

        rs.movefirst

        response.write rs.fields("content")            

    end if

    conn.close()
    
    set rs = nothing

%>